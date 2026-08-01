import { createPublicKnowledgeClient } from "@/lib/supabase/server";

type ContactRow = {
  id: string;
  name_th: string;
  helps_with_th: string;
  source_label_th: string;
  source_url: string;
  channels: Array<{ label: string; detail?: string | null; href?: string | null; urgent?: boolean }> | null;
};

type GroupRow = { id: string; title_th: string; description_th: string };
type ThreatRow = { id: string; group_id: string; label_th: string; detail_th: string; contact_ids: string[] };
type KeywordRow = { threat_id: string; keyword_th: string };

export async function GET() {
  try {
    const supabase = createPublicKnowledgeClient();
    const [contactsResult, groupsResult, threatsResult, keywordsResult] = await Promise.all([
      supabase.from("published_emergency_contacts").select("id,name_th,helps_with_th,source_label_th,source_url,channels").order("sort_order"),
      supabase.from("published_emergency_threat_groups").select("id,title_th,description_th").order("sort_order"),
      supabase.from("published_emergency_threats").select("id,group_id,label_th,detail_th,contact_ids").order("group_id").order("sort_order"),
      supabase.from("published_emergency_threat_keywords").select("threat_id,keyword_th"),
    ]);

    const error = contactsResult.error ?? groupsResult.error ?? threatsResult.error ?? keywordsResult.error;
    if (error) return Response.json({ error: "knowledge_unavailable" }, { status: 503 });

    const contacts = (contactsResult.data ?? []) as ContactRow[];
    const groups = (groupsResult.data ?? []) as GroupRow[];
    const threats = (threatsResult.data ?? []) as ThreatRow[];
    const keywords = (keywordsResult.data ?? []) as KeywordRow[];
    if (contacts.length === 0 || groups.length === 0 || threats.length === 0) {
      return Response.json({ error: "knowledge_empty" }, { status: 503 });
    }

    const keywordMap = keywords.reduce<Record<string, string[]>>((catalog, item) => {
      catalog[item.threat_id] ??= [];
      catalog[item.threat_id].push(item.keyword_th);
      return catalog;
    }, {});

    return Response.json(
      {
        data: {
          contacts: contacts.map((contact) => ({
            id: contact.id,
            name: contact.name_th,
            helpsWith: contact.helps_with_th,
            sourceLabel: contact.source_label_th,
            sourceUrl: contact.source_url,
            channels: (contact.channels ?? []).map((channel) => ({
              label: channel.label,
              detail: channel.detail ?? undefined,
              href: channel.href ?? undefined,
              urgent: channel.urgent ?? false,
            })),
          })),
          threatGroups: groups.map((group) => ({
            id: group.id,
            title: group.title_th,
            description: group.description_th,
            threats: threats
              .filter((threat) => threat.group_id === group.id)
              .map((threat) => ({ id: threat.id, label: threat.label_th, detail: threat.detail_th, contactIds: threat.contact_ids })),
          })),
          keywords: keywordMap,
          checkedAt: new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeZone: "Asia/Bangkok" }).format(new Date()),
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json({ error: "knowledge_not_configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
