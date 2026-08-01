"use client";

import { WorkflowAiAssistant } from "@/components/workflow-ai-assistant";
import type { AssistanceMode } from "@/lib/story-assistance";
import type { FinalDecision, SuggestedAgency } from "@/lib/workflow-guidance";

export type TrackingDraft = {
  status: "not-sent" | "sent";
  channel: string;
  sentDate: string;
  referenceNumber: string;
  followUpDate: string;
  note: string;
};

type SubmissionGuidanceProps = {
  decision: FinalDecision;
  agency: SuggestedAgency;
  tracking: TrackingDraft;
  mode: AssistanceMode;
  consent: boolean;
  context: string;
  onTrackingChange: (tracking: TrackingDraft) => void;
  onBack: () => void;
  onRestart: () => void;
  onRequireConsent: () => void;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export function SubmissionGuidance({
  decision,
  agency,
  tracking,
  mode,
  consent,
  context,
  onTrackingChange,
  onBack,
  onRestart,
  onRequireConsent,
}: SubmissionGuidanceProps) {
  const shouldSubmit = decision !== "prepare";
  const grounding = [
    `หน่วยงาน: ${agency.name}`,
    `หน่วยงานทำได้: ${agency.canDo}`,
    `หน่วยงานทำไม่ได้: ${agency.cannotDo}`,
    ...agency.channels.map((channel) => `ช่องทางที่ตรวจสอบแล้ว: ${channel.label}${channel.detail ? ` — ${channel.detail}` : ""}`),
    "หลังส่งควรเก็บสำเนา หลักฐานการส่ง เลขอ้างอิง และวันที่ติดต่อทุกครั้ง",
    "หากไม่มีคำตอบ ให้ตรวจสถานะผ่านช่องทางของหน่วยงานก่อน และขอคำปรึกษาหากมีกำหนดเวลาทางกฎหมาย",
  ];

  function updateTracking<Field extends keyof TrackingDraft>(field: Field, value: TrackingDraft[Field]) {
    onTrackingChange({ ...tracking, [field]: value });
  }

  function downloadTrackingRecord() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>บันทึกการติดตามเรื่อง</title><style>body{font-family:'Bai Jamjuree','Tahoma',sans-serif;line-height:1.8;margin:48px;color:#102c3d}h1{font-size:22px}</style></head><body>
      <h1>บันทึกการส่งและติดตามเรื่อง</h1>
      <p><strong>หน่วยงาน:</strong> ${escapeHtml(agency.name)}</p>
      <p><strong>สถานะ:</strong> ${tracking.status === "sent" ? "ส่งแล้ว" : "ยังไม่ส่ง"}</p>
      <p><strong>ช่องทาง:</strong> ${escapeHtml(tracking.channel || "ยังไม่ระบุ")}</p>
      <p><strong>วันที่ส่ง:</strong> ${escapeHtml(tracking.sentDate || "ยังไม่ระบุ")}</p>
      <p><strong>เลขอ้างอิง:</strong> ${escapeHtml(tracking.referenceNumber || "ยังไม่ระบุ")}</p>
      <p><strong>วันที่จะติดตาม:</strong> ${escapeHtml(tracking.followUpDate || "ยังไม่ระบุ")}</p>
      <p><strong>บันทึก:</strong> ${escapeHtml(tracking.note || "-")}</p>
      <p>เก็บเอกสารนี้และหลักฐานการส่งไว้กับผู้ร้อง ระบบสิทธิไปต่อไม่ได้บันทึกข้อมูลชุดนี้</p>
    </body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "บันทึกติดตามเรื่อง.doc";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 11 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">{shouldSubmit ? "ส่งเรื่อง รับเลขอ้างอิง และติดตาม" : "เก็บชุดเตรียมความพร้อมไว้กับคุณ"}</h2>
        </div>
        <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">ขั้นสุดท้าย</span>
      </div>

      {shouldSubmit ? (
        <>
          <section className="mt-7 border border-line bg-white p-5">
            <h3 className="text-xl font-bold text-ink">ช่องทางของ {agency.name}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">ระบบไม่ส่งเรื่องให้อัตโนมัติ คุณเป็นผู้ตรวจทานและเลือกช่องทางส่งด้วยตนเอง</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {agency.channels.map((channel) => (
                <a key={channel.label} href={channel.href} target={channel.type === "website" ? "_blank" : undefined} rel={channel.type === "website" ? "noreferrer" : undefined} className="inline-flex min-h-12 items-center bg-river px-5 py-3 font-bold text-white no-underline hover:bg-ink">
                  {channel.type === "phone" ? "☎ " : ""}{channel.label}
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-ink-soft">ตรวจสอบล่าสุด {agency.lastVerifiedAt} · <a href={agency.source.url} target="_blank" rel="noreferrer" className="font-bold text-river underline underline-offset-4">{agency.source.label}</a></p>
          </section>

          <ol className="mt-6 grid gap-3 text-sm leading-6 text-ink">
            <li className="border-l-4 border-river bg-[#e9f4f2] p-4"><strong>1. ตรวจเอกสารอีกครั้ง</strong><span className="block text-ink-soft">ชื่อ วันเวลา ข้อเท็จจริง คำขอ เอกสารแนบ และข้อมูลที่ไม่ควรเปิดเผย</span></li>
            <li className="border-l-4 border-river bg-[#e9f4f2] p-4"><strong>2. ขอหลักฐานการรับเรื่อง</strong><span className="block text-ink-soft">เลขรับ วันที่รับ ชื่อช่องทาง และภาพหน้าจอหรือใบตอบรับ</span></li>
            <li className="border-l-4 border-river bg-[#e9f4f2] p-4"><strong>3. เก็บสำเนาไว้กับคุณ</strong><span className="block text-ink-soft">อย่าส่งต้นฉบับหลักฐานเพียงชุดเดียว และอย่าเก็บรหัสผ่านไว้ในบันทึกนี้</span></li>
            <li className="border-l-4 border-river bg-[#e9f4f2] p-4"><strong>4. ติดตามผ่านช่องทางของหน่วยงาน</strong><span className="block text-ink-soft">ใช้เลขอ้างอิงทุกครั้ง หากมีกำหนดเวลาทางกฎหมายให้ขอผู้เชี่ยวชาญตรวจโดยไม่รอผลติดตามปกติ</span></li>
          </ol>
        </>
      ) : (
        <section className="mt-7 border-l-4 border-saffron bg-[#fff8e8] p-5">
          <h3 className="text-xl font-bold text-ink">ยังไม่ต้องส่งเรื่องในวันนี้</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">ดาวน์โหลดแผนและเก็บหลักฐานไว้ในที่ปลอดภัย หากสถานการณ์เปลี่ยนหรือใกล้กำหนดเวลา ให้กลับมาประเมินใหม่หรือขอคำปรึกษาจาก {agency.name}</p>
        </section>
      )}

      <section className="mt-6 border border-line bg-paper p-5">
        <h3 className="text-lg font-bold text-ink">บันทึกติดตาม — อยู่ในเบราว์เซอร์เท่านั้น</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-ink">สถานะ
            <select value={tracking.status} onChange={(event) => updateTracking("status", event.target.value as TrackingDraft["status"])} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal">
              <option value="not-sent">ยังไม่ส่ง</option>
              <option value="sent">ส่งแล้ว</option>
            </select>
          </label>
          <label className="text-sm font-bold text-ink">ช่องทางที่ใช้
            <input value={tracking.channel} onChange={(event) => updateTracking("channel", event.target.value.slice(0, 160))} maxLength={160} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-ink">วันที่ส่ง
            <input type="date" value={tracking.sentDate} onChange={(event) => updateTracking("sentDate", event.target.value)} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-ink">เลขรับ/เลขอ้างอิง
            <input value={tracking.referenceNumber} onChange={(event) => updateTracking("referenceNumber", event.target.value.slice(0, 120))} maxLength={120} autoComplete="off" className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-ink">วันที่จะติดตาม
            <input type="date" value={tracking.followUpDate} onChange={(event) => updateTracking("followUpDate", event.target.value)} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
          </label>
          <label className="text-sm font-bold text-ink">บันทึกสั้น ๆ
            <input value={tracking.note} onChange={(event) => updateTracking("note", event.target.value.slice(0, 300))} maxLength={300} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
          </label>
        </div>
        <button type="button" onClick={downloadTrackingRecord} className="mt-5 min-h-12 border border-river bg-white px-5 py-3 font-bold text-river">ดาวน์โหลดบันทึกติดตาม</button>
      </section>

      <WorkflowAiAssistant
        stage="submission"
        mode={mode}
        consent={consent}
        context={context}
        grounding={grounding}
        buttonLabel="ให้ AI ช่วยวางแผนติดตาม"
        onRequireConsent={onRequireConsent}
      />

      <aside className="mt-6 border-l-4 border-river bg-[#e9f4f2] p-4 text-sm leading-6 text-ink">
        <strong className="block">ระบบทำครบทั้ง 11 ขั้นแล้ว</strong>
        เรื่อง เอกสาร และบันทึกติดตามยังอยู่เฉพาะในหน้านี้ เมื่อปิดหรือโหลดใหม่ข้อมูลจะหาย โปรดดาวน์โหลดสิ่งที่ต้องการเก็บก่อน
      </aside>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">← กลับไปตรวจชุดเอกสาร</button>
        <button type="button" onClick={onRestart} className="min-h-12 bg-ink px-7 py-3 font-bold text-white hover:bg-river">เริ่มเรื่องใหม่และล้างข้อมูล →</button>
      </div>
    </>
  );
}
