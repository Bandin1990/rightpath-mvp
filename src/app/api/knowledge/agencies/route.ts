import { createPublicKnowledgeClient } from "@/lib/supabase/server";
import { z } from "zod";

const querySchema = z.object({
  complaintType: z.string().trim().min(1).max(80).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    complaintType: url.searchParams.get("complaintType") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: "invalid_query" }, { status: 400 });
  }

  try {
    const supabase = createPublicKnowledgeClient();
    let query = supabase
      .from("published_agencies")
      .select("id, slug, name_th, summary_th, can_do_th, cannot_do_th, channels, complaint_type_slugs")
      .order("name_th")
      .limit(50);

    if (parsed.data.complaintType) {
      query = query.contains("complaint_type_slugs", [parsed.data.complaintType]);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json({ error: "knowledge_unavailable" }, { status: 503 });
    }

    return Response.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "knowledge_not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
