"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { emergencyThreatKeywords } from "@/lib/emergency-classifier";
import { emergencyContacts, urgentThreatGroups } from "@/lib/emergency-guidance";
import { createAdminServerClient, requireAdminUser } from "@/lib/supabase/admin-server";
import { getSupabaseConfig } from "@/lib/supabase/config";

const reviewStatusSchema = z.enum(["draft", "reviewed", "published", "retired"]);
const slugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/);

function splitCommaList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signInAction(formData: FormData) {
  if (!getSupabaseConfig()) redirect("/admin/login?error=not-configured");

  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(8).max(200) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });

  if (!parsed.success) redirect("/admin/login?error=invalid-form");

  const supabase = await createAdminServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/admin/login?error=invalid-credentials");

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createAdminServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function seedEmergencyKnowledgeAction() {
  const { supabase } = await requireAdminUser(["publisher", "admin"]);
  const knowledge = supabase.schema("knowledge");
  const verifiedAt = new Date().toISOString();

  const contacts = emergencyContacts.map((contact, index) => ({
    id: contact.id,
    name_th: contact.name,
    helps_with_th: contact.helpsWith,
    source_label_th: contact.sourceLabel,
    source_url: contact.sourceUrl,
    sort_order: (index + 1) * 10,
    review_status: "published",
    last_verified_at: verifiedAt,
    updated_at: verifiedAt,
  }));
  const { error: contactsError } = await knowledge.from("emergency_contacts").upsert(contacts);
  if (contactsError) throw new Error(`seed_contacts_failed:${contactsError.code}`);

  const contactIds = emergencyContacts.map((contact) => contact.id);
  const { error: deleteChannelsError } = await knowledge.from("emergency_contact_channels").delete().in("contact_id", contactIds);
  if (deleteChannelsError) throw new Error(`seed_channels_cleanup_failed:${deleteChannelsError.code}`);

  const channels = emergencyContacts.flatMap((contact) =>
    contact.channels.map((channel, index) => ({
      contact_id: contact.id,
      label_th: channel.label,
      detail_th: channel.detail ?? null,
      href: channel.href ?? null,
      urgent: channel.urgent ?? false,
      sort_order: (index + 1) * 10,
      review_status: "published",
      last_verified_at: verifiedAt,
      updated_at: verifiedAt,
    })),
  );
  const { error: channelsError } = await knowledge.from("emergency_contact_channels").insert(channels);
  if (channelsError) throw new Error(`seed_channels_failed:${channelsError.code}`);

  const groups = urgentThreatGroups.map((group, index) => ({
    id: group.id,
    title_th: group.title,
    description_th: group.description,
    sort_order: (index + 1) * 10,
    review_status: "published",
    last_verified_at: verifiedAt,
    updated_at: verifiedAt,
  }));
  const { error: groupsError } = await knowledge.from("emergency_threat_groups").upsert(groups);
  if (groupsError) throw new Error(`seed_groups_failed:${groupsError.code}`);

  const threats = urgentThreatGroups.flatMap((group) =>
    group.threats.map((threat, index) => ({
      id: threat.id,
      group_id: group.id,
      label_th: threat.label,
      detail_th: threat.detail,
      contact_ids: threat.contactIds,
      sort_order: (index + 1) * 10,
      review_status: "published",
      last_verified_at: verifiedAt,
      updated_at: verifiedAt,
    })),
  );
  const { error: threatsError } = await knowledge.from("emergency_threats").upsert(threats);
  if (threatsError) throw new Error(`seed_threats_failed:${threatsError.code}`);

  const threatIds = threats.map((threat) => threat.id);
  const { error: deleteKeywordsError } = await knowledge.from("emergency_threat_keywords").delete().in("threat_id", threatIds);
  if (deleteKeywordsError) throw new Error(`seed_keywords_cleanup_failed:${deleteKeywordsError.code}`);

  const keywords = Object.entries(emergencyThreatKeywords).flatMap(([threatId, entries]) =>
    entries.map((keyword) => ({ threat_id: threatId, keyword_th: keyword, weight: 5, review_status: "published", updated_at: verifiedAt })),
  );
  const { error: keywordsError } = await knowledge.from("emergency_threat_keywords").insert(keywords);
  if (keywordsError) throw new Error(`seed_keywords_failed:${keywordsError.code}`);

  revalidatePath("/admin");
}

export async function saveEmergencyGroupAction(formData: FormData) {
  const { supabase } = await requireAdminUser();
  const parsed = z
    .object({
      id: slugSchema,
      title_th: z.string().trim().min(2).max(160),
      description_th: z.string().trim().min(10).max(800),
      review_status: reviewStatusSchema,
      sort_order: z.coerce.number().int().min(1).max(1000),
    })
    .parse({
      id: formData.get("id"),
      title_th: formData.get("title_th"),
      description_th: formData.get("description_th"),
      review_status: formData.get("review_status"),
      sort_order: formData.get("sort_order"),
    });

  const now = new Date().toISOString();
  const { error } = await supabase.schema("knowledge").from("emergency_threat_groups").upsert({
    ...parsed,
    last_verified_at: now,
    updated_at: now,
  });
  if (error) throw new Error(`save_group_failed:${error.code}`);
  revalidatePath("/admin");
}

export async function saveEmergencyContactAction(formData: FormData) {
  const { supabase } = await requireAdminUser();
  const parsed = z
    .object({
      id: slugSchema,
      name_th: z.string().trim().min(2).max(160),
      helps_with_th: z.string().trim().min(10).max(1000),
      source_label_th: z.string().trim().min(2).max(200),
      source_url: z.string().url().startsWith("https://"),
      review_status: reviewStatusSchema,
      sort_order: z.coerce.number().int().min(1).max(1000),
    })
    .parse({
      id: formData.get("id"),
      name_th: formData.get("name_th"),
      helps_with_th: formData.get("helps_with_th"),
      source_label_th: formData.get("source_label_th"),
      source_url: formData.get("source_url"),
      review_status: formData.get("review_status"),
      sort_order: formData.get("sort_order"),
    });

  const now = new Date().toISOString();
  const { error } = await supabase.schema("knowledge").from("emergency_contacts").upsert({
    ...parsed,
    last_verified_at: now,
    updated_at: now,
  });
  if (error) throw new Error(`save_contact_failed:${error.code}`);
  revalidatePath("/admin");
}

export async function saveEmergencyThreatAction(formData: FormData) {
  const { supabase } = await requireAdminUser();
  const parsed = z
    .object({
      id: slugSchema,
      group_id: slugSchema,
      label_th: z.string().trim().min(5).max(500),
      detail_th: z.string().trim().min(5).max(1000),
      review_status: reviewStatusSchema,
      sort_order: z.coerce.number().int().min(1).max(1000),
    })
    .parse({
      id: formData.get("id"),
      group_id: formData.get("group_id"),
      label_th: formData.get("label_th"),
      detail_th: formData.get("detail_th"),
      review_status: formData.get("review_status"),
      sort_order: formData.get("sort_order"),
    });
  const contactIds = splitCommaList(formData.get("contact_ids"));
  const keywords = splitCommaList(formData.get("keywords"));
  if (contactIds.length === 0) throw new Error("contact_ids_required");

  const now = new Date().toISOString();
  const knowledge = supabase.schema("knowledge");
  const { error } = await knowledge.from("emergency_threats").upsert({
    ...parsed,
    contact_ids: contactIds,
    last_verified_at: now,
    updated_at: now,
  });
  if (error) throw new Error(`save_threat_failed:${error.code}`);

  const { error: deleteError } = await knowledge.from("emergency_threat_keywords").delete().eq("threat_id", parsed.id);
  if (deleteError) throw new Error(`save_keywords_cleanup_failed:${deleteError.code}`);
  if (keywords.length > 0) {
    const { error: keywordError } = await knowledge.from("emergency_threat_keywords").insert(
      keywords.map((keyword) => ({
        threat_id: parsed.id,
        keyword_th: keyword,
        weight: 5,
        review_status: parsed.review_status,
        updated_at: now,
      })),
    );
    if (keywordError) throw new Error(`save_keywords_failed:${keywordError.code}`);
  }

  revalidatePath("/admin");
}

export async function saveEmergencyChannelAction(formData: FormData) {
  const { supabase } = await requireAdminUser();
  const parsed = z
    .object({
      contact_id: slugSchema,
      label_th: z.string().trim().min(2).max(120),
      detail_th: z.string().trim().max(300).nullable(),
      href: z.union([z.literal(""), z.string().regex(/^(https:\/\/|tel:|mailto:)/)]),
      urgent: z.boolean(),
      review_status: reviewStatusSchema,
      sort_order: z.coerce.number().int().min(1).max(1000),
    })
    .parse({
      contact_id: formData.get("contact_id"),
      label_th: formData.get("label_th"),
      detail_th: requireValue(formData, "detail_th") || null,
      href: requireValue(formData, "href"),
      urgent: formData.get("urgent") === "on",
      review_status: formData.get("review_status"),
      sort_order: formData.get("sort_order"),
    });

  const now = new Date().toISOString();
  const { error } = await supabase.schema("knowledge").from("emergency_contact_channels").insert({
    ...parsed,
    href: parsed.href || null,
    last_verified_at: now,
    updated_at: now,
  });
  if (error) throw new Error(`save_channel_failed:${error.code}`);
  revalidatePath("/admin");
}
