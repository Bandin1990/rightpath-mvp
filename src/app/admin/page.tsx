import Link from "next/link";
import { redirect } from "next/navigation";
import {
  saveEmergencyChannelAction,
  saveEmergencyContactAction,
  saveEmergencyGroupAction,
  saveEmergencyThreatAction,
  seedEmergencyKnowledgeAction,
  signOutAction,
} from "@/app/admin/actions";
import { isAdminRole, createAdminServerClient } from "@/lib/supabase/admin-server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type ContactRow = {
  id: string;
  name_th: string;
  helps_with_th: string;
  source_label_th: string;
  source_url: string;
  sort_order: number;
  review_status: string;
};

type ChannelRow = {
  id: string;
  contact_id: string;
  label_th: string;
  detail_th: string | null;
  href: string | null;
  urgent: boolean;
  review_status: string;
};

type GroupRow = {
  id: string;
  title_th: string;
  description_th: string;
  sort_order: number;
  review_status: string;
};

type ThreatRow = {
  id: string;
  group_id: string;
  label_th: string;
  detail_th: string;
  contact_ids: string[];
  sort_order: number;
  review_status: string;
};

type KeywordRow = { threat_id: string; keyword_th: string };

const inputClass = "min-h-11 w-full border border-line bg-paper px-3 py-2 text-sm font-normal text-ink focus:border-river focus:outline-none";
const textareaClass = `${inputClass} min-h-24 resize-y leading-6`;

function StatusBadge({ status }: { status: string }) {
  const styles = status === "published" ? "bg-[#e9f4f2] text-river" : status === "retired" ? "bg-[#edf0f0] text-ink-soft" : "bg-[#fff2d5] text-[#7a5510]";
  return <span className={`inline-flex px-2 py-1 text-[0.7rem] font-bold ${styles}`}>{status}</span>;
}

function ReviewStatusSelect({ value = "draft" }: { value?: string }) {
  return (
    <select name="review_status" defaultValue={value} className={inputClass}>
      <option value="draft">ฉบับร่าง</option>
      <option value="reviewed">ตรวจทานแล้ว</option>
      <option value="published">เผยแพร่</option>
      <option value="retired">ยกเลิกใช้</option>
    </select>
  );
}

export default async function AdminPage() {
  if (!getSupabaseConfig()) redirect("/admin/login?error=not-configured");

  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const roleValue = user.app_metadata?.role;
  if (!isAdminRole(roleValue)) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-sm font-bold text-coral">ไม่มีสิทธิเข้าถึง</p>
        <h1 className="mt-3 text-4xl font-bold text-ink">บัญชีนี้ยังไม่มีบทบาทผู้ดูแล</h1>
        <p className="mt-5 leading-7 text-ink-soft">ให้ผู้ดูแลโครงการกำหนด app_metadata.role เป็น editor, reviewer, publisher หรือ admin แล้วเข้าสู่ระบบใหม่</p>
        <form action={signOutAction} className="mt-8"><button className="border border-ink px-5 py-3 font-bold text-ink">ออกจากระบบ</button></form>
      </main>
    );
  }

  const knowledge = supabase.schema("knowledge");
  const [contactsResult, channelsResult, groupsResult, threatsResult, keywordsResult] = await Promise.all([
    knowledge.from("emergency_contacts").select("id,name_th,helps_with_th,source_label_th,source_url,sort_order,review_status").order("sort_order"),
    knowledge.from("emergency_contact_channels").select("id,contact_id,label_th,detail_th,href,urgent,review_status").order("sort_order"),
    knowledge.from("emergency_threat_groups").select("id,title_th,description_th,sort_order,review_status").order("sort_order"),
    knowledge.from("emergency_threats").select("id,group_id,label_th,detail_th,contact_ids,sort_order,review_status").order("group_id").order("sort_order"),
    knowledge.from("emergency_threat_keywords").select("threat_id,keyword_th").order("keyword_th"),
  ]);

  const dataError = contactsResult.error ?? channelsResult.error ?? groupsResult.error ?? threatsResult.error ?? keywordsResult.error;
  const contacts = (contactsResult.data ?? []) as ContactRow[];
  const channels = (channelsResult.data ?? []) as ChannelRow[];
  const groups = (groupsResult.data ?? []) as GroupRow[];
  const threats = (threatsResult.data ?? []) as ThreatRow[];
  const keywords = (keywordsResult.data ?? []) as KeywordRow[];

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-10">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-river">สิทธิไปต่อ • ระบบหลังบ้าน</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">โต๊ะตรวจทานข้อมูลช่วยเหลือ</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-[#e9f4f2] px-3 py-2 font-bold text-river">บทบาท {roleValue}</span>
            <Link href="/" className="font-bold text-ink underline underline-offset-4">ดูหน้าประชาชน</Link>
            <form action={signOutAction}><button className="font-bold text-coral underline underline-offset-4">ออกจากระบบ</button></form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["หน่วยงาน", contacts.length],
            ["ช่องทางติดต่อ", channels.length],
            ["รายการภัย", threats.length],
            ["คำจับคู่", keywords.length],
          ].map(([label, count]) => (
            <article key={label} className="border-t-4 border-river bg-white p-5">
              <p className="text-sm text-ink-soft">{label}</p>
              <p className="mt-2 text-4xl font-bold text-ink">{count}</p>
            </article>
          ))}
        </section>

        {dataError && (
          <p role="alert" className="mt-6 border-l-4 border-coral bg-[#fff0ed] p-4 text-sm text-ink">
            อ่านฐานข้อมูลไม่สำเร็จ ({dataError.code}) กรุณาตรวจ migration และสิทธิ RLS
          </p>
        )}

        {contacts.length === 0 && groups.length === 0 && (roleValue === "publisher" || roleValue === "admin") && (
          <section className="mt-8 border-2 border-dashed border-river bg-white p-6">
            <h2 className="text-2xl font-bold text-ink">เริ่มจากชุดข้อมูลที่ตรวจสอบแล้ว</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">นำเข้ารายการภัย 28 รายการ หน่วยงาน ช่องทาง และคำจับคู่ที่ใช้ในต้นแบบปัจจุบัน จากนั้นแก้ไขและควบคุมสถานะเผยแพร่ได้ที่หน้านี้</p>
            <form action={seedEmergencyKnowledgeAction} className="mt-5">
              <button className="bg-river px-5 py-3 font-bold text-white hover:bg-ink">นำเข้าชุดข้อมูลเริ่มต้น</button>
            </form>
          </section>
        )}

        <div className="mt-10 grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <section>
            <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
              <div><p className="text-xs font-bold tracking-[0.12em] text-river">ทะเบียนปลายทาง</p><h2 className="mt-1 text-3xl font-bold text-ink">หน่วยงานและช่องทาง</h2></div>
              <span className="text-sm text-ink-soft">{contacts.length} แห่ง</span>
            </div>

            <details className="mt-5 border border-line bg-white p-5">
              <summary className="cursor-pointer font-bold text-river">+ เพิ่มหน่วยงาน</summary>
              <form action={saveEmergencyContactAction} className="mt-5 grid gap-3">
                <input name="id" required placeholder="รหัสอังกฤษ เช่น local-rescue" className={inputClass} />
                <input name="name_th" required placeholder="ชื่อหน่วยงาน" className={inputClass} />
                <textarea name="helps_with_th" required placeholder="ช่วยเรื่องใด" className={textareaClass} />
                <input name="source_label_th" required placeholder="ชื่อแหล่งข้อมูลทางการ" className={inputClass} />
                <input name="source_url" type="url" required placeholder="https://..." className={inputClass} />
                <div className="grid grid-cols-2 gap-3"><input name="sort_order" type="number" defaultValue="100" className={inputClass} /><ReviewStatusSelect /></div>
                <button className="min-h-11 bg-ink px-4 font-bold text-white">บันทึกหน่วยงาน</button>
              </form>
            </details>

            <div className="mt-4 grid gap-3">
              {contacts.map((contact) => (
                <details key={contact.id} className="border border-line bg-white p-5">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-ink">{contact.name_th}</h3><p className="mt-1 text-xs text-ink-soft">{channels.filter((channel) => channel.contact_id === contact.id).map((channel) => channel.label_th).join(" · ") || "ยังไม่มีช่องทาง"}</p></div><StatusBadge status={contact.review_status} /></div>
                  </summary>
                  <form action={saveEmergencyContactAction} className="mt-5 grid gap-3 border-t border-line pt-5">
                    <input type="hidden" name="id" value={contact.id} />
                    <input name="name_th" defaultValue={contact.name_th} required className={inputClass} />
                    <textarea name="helps_with_th" defaultValue={contact.helps_with_th} required className={textareaClass} />
                    <input name="source_label_th" defaultValue={contact.source_label_th} required className={inputClass} />
                    <input name="source_url" type="url" defaultValue={contact.source_url} required className={inputClass} />
                    <div className="grid grid-cols-2 gap-3"><input name="sort_order" type="number" defaultValue={contact.sort_order} className={inputClass} /><ReviewStatusSelect value={contact.review_status} /></div>
                    <button className="min-h-11 border border-river px-4 font-bold text-river">บันทึกการแก้ไข</button>
                  </form>
                  <form action={saveEmergencyChannelAction} className="mt-5 grid gap-3 border-t border-line pt-5">
                    <p className="text-sm font-bold text-ink">เพิ่มช่องทางติดต่อ</p>
                    <input type="hidden" name="contact_id" value={contact.id} />
                    <input name="label_th" required placeholder="เช่น โทร 191" className={inputClass} />
                    <input name="href" placeholder="tel:191 หรือ https://..." className={inputClass} />
                    <input name="detail_th" placeholder="รายละเอียดเพิ่มเติม" className={inputClass} />
                    <div className="grid grid-cols-2 gap-3"><input name="sort_order" type="number" defaultValue="100" className={inputClass} /><ReviewStatusSelect /></div>
                    <label className="flex items-center gap-2 text-sm text-ink"><input name="urgent" type="checkbox" /> ช่องทางเร่งด่วน</label>
                    <button className="min-h-11 border border-river px-4 font-bold text-river">เพิ่มช่องทาง</button>
                  </form>
                </details>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-3">
              <div><p className="text-xs font-bold tracking-[0.12em] text-river">กฎคัดกรอง</p><h2 className="mt-1 text-3xl font-bold text-ink">ภัยและคำจับคู่</h2></div>
              <span className="text-sm text-ink-soft">{threats.length} รายการ</span>
            </div>

            <details className="mt-5 border border-line bg-white p-5">
              <summary className="cursor-pointer font-bold text-river">+ เพิ่มหมวดภัย</summary>
              <form action={saveEmergencyGroupAction} className="mt-5 grid gap-3">
                <input name="id" required placeholder="รหัสอังกฤษ" className={inputClass} />
                <input name="title_th" required placeholder="ชื่อหมวด" className={inputClass} />
                <textarea name="description_th" required placeholder="คำอธิบายหมวด" className={textareaClass} />
                <div className="grid grid-cols-2 gap-3"><input name="sort_order" type="number" defaultValue="100" className={inputClass} /><ReviewStatusSelect /></div>
                <button className="min-h-11 bg-ink px-4 font-bold text-white">บันทึกหมวดภัย</button>
              </form>
            </details>

            <details className="mt-3 border border-line bg-white p-5">
              <summary className="cursor-pointer font-bold text-river">+ เพิ่มรายการภัย</summary>
              <form action={saveEmergencyThreatAction} className="mt-5 grid gap-3">
                <input name="id" required placeholder="รหัสอังกฤษ" className={inputClass} />
                <select name="group_id" required className={inputClass}><option value="">เลือกหมวดภัย</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.title_th}</option>)}</select>
                <textarea name="label_th" required placeholder="ข้อความที่ประชาชนเห็น" className={textareaClass} />
                <textarea name="detail_th" required placeholder="สิ่งที่ควรทำทันที" className={textareaClass} />
                <input name="contact_ids" required placeholder="รหัสหน่วยงาน คั่นด้วยจุลภาค" className={inputClass} />
                <textarea name="keywords" placeholder="คำจับคู่ คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่" className={textareaClass} />
                <div className="grid grid-cols-2 gap-3"><input name="sort_order" type="number" defaultValue="100" className={inputClass} /><ReviewStatusSelect /></div>
                <button className="min-h-11 bg-ink px-4 font-bold text-white">บันทึกรายการภัย</button>
              </form>
            </details>

            <div className="mt-4 grid gap-3">
              {groups.map((group) => (
                <section key={group.id} className="border-l-4 border-river bg-white p-5">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-river">{group.id}</p><h3 className="mt-1 text-xl font-bold text-ink">{group.title_th}</h3></div><StatusBadge status={group.review_status} /></div>
                  <div className="mt-4 grid gap-2">
                    {threats.filter((threat) => threat.group_id === group.id).map((threat) => (
                      <details key={threat.id} className="border border-line p-4">
                        <summary className="cursor-pointer text-sm font-bold leading-6 text-ink">{threat.label_th}</summary>
                        <form action={saveEmergencyThreatAction} className="mt-4 grid gap-3 border-t border-line pt-4">
                          <input type="hidden" name="id" value={threat.id} />
                          <select name="group_id" defaultValue={threat.group_id} className={inputClass}>{groups.map((option) => <option key={option.id} value={option.id}>{option.title_th}</option>)}</select>
                          <textarea name="label_th" defaultValue={threat.label_th} className={textareaClass} />
                          <textarea name="detail_th" defaultValue={threat.detail_th} className={textareaClass} />
                          <input name="contact_ids" defaultValue={threat.contact_ids.join(", ")} className={inputClass} />
                          <textarea name="keywords" defaultValue={keywords.filter((keyword) => keyword.threat_id === threat.id).map((keyword) => keyword.keyword_th).join(", ")} className={textareaClass} />
                          <div className="grid grid-cols-2 gap-3"><input name="sort_order" type="number" defaultValue={threat.sort_order} className={inputClass} /><ReviewStatusSelect value={threat.review_status} /></div>
                          <button className="min-h-11 border border-river px-4 font-bold text-river">บันทึกกฎนี้</button>
                        </form>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
