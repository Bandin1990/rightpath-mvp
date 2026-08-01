"use client";

import { useState } from "react";
import { WorkflowAiAssistant } from "@/components/workflow-ai-assistant";
import type { AssistanceMode } from "@/lib/story-assistance";
import type { FinalDecision, SuggestedAgency } from "@/lib/workflow-guidance";

export type DocumentDraft = {
  date: string;
  name: string;
  contact: string;
  address: string;
  subject: string;
  facts: string;
  requests: string;
  selectedEvidence: string[];
};

type ComplaintPackageBuilderProps = {
  decision: FinalDecision;
  agency: SuggestedAgency;
  evidenceChecklist: string[];
  draft: DocumentDraft;
  mode: AssistanceMode;
  consent: boolean;
  aiContext: string;
  onDraftChange: (draft: DocumentDraft) => void;
  onBack: () => void;
  onContinue: () => void;
  onRequireConsent: () => void;
};

const decisionLabels: Record<FinalDecision, { title: string; badge: string; requestLabel: string }> = {
  complaint: { title: "สร้างหนังสือร้องเรียนและชุดพร้อมยื่น", badge: "พร้อมตรวจทานก่อนส่ง", requestLabel: "สิ่งที่ขอให้หน่วยงานดำเนินการ" },
  consult: { title: "สร้างสรุปเพื่อขอคำปรึกษา", badge: "ยังไม่ยื่นร้องเรียน", requestLabel: "คำถามหรือความช่วยเหลือที่ต้องการ" },
  prepare: { title: "สร้างแผนเก็บข้อมูลเพิ่ม", badge: "เก็บไว้กับคุณ", requestLabel: "เป้าหมายการเตรียมข้อมูล" },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function formatMultiline(value: string) {
  return escapeHtml(value).replace(/\n/gu, "<br>");
}

function buildDocumentHtml(decision: FinalDecision, agency: SuggestedAgency, draft: DocumentDraft) {
  const labels = decisionLabels[decision];
  const evidence = draft.selectedEvidence.length > 0
    ? `<ol>${draft.selectedEvidence.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
    : "<p>ยังไม่ได้ระบุเอกสารแนบ</p>";
  const dateText = draft.date ? escapeHtml(draft.date) : "................................................";
  const nameText = draft.name ? escapeHtml(draft.name) : "................................................";
  const contactText = draft.contact ? escapeHtml(draft.contact) : "................................................";
  const addressText = draft.address ? formatMultiline(draft.address) : "................................................";

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(labels.title)}</title><style>
    body{font-family:'Bai Jamjuree','Tahoma',sans-serif;font-size:16px;line-height:1.75;margin:48px;color:#102c3d}
    h1{text-align:center;font-size:22px} h2{font-size:18px;margin-top:24px} .right{text-align:right} .signature{margin-top:48px;text-align:center;margin-left:55%}
    .notice{border-left:4px solid #d89b2b;padding:12px;background:#fff8e8} ol{padding-left:28px}
  </style></head><body>
    <h1>${escapeHtml(labels.title)}</h1>
    <p class="right">วันที่ ${dateText}</p>
    ${decision === "prepare" ? "" : `<p><strong>เรียน</strong> ${escapeHtml(agency.name)}</p>`}
    <p><strong>เรื่อง</strong> ${escapeHtml(draft.subject || labels.title)}</p>
    <p><strong>ชื่อผู้จัดทำ/ผู้ร้อง</strong> ${nameText}</p>
    <p><strong>ช่องทางติดต่อ</strong> ${contactText}</p>
    <p><strong>ที่อยู่หรือข้อมูลติดต่อเพิ่มเติม</strong><br>${addressText}</p>
    <h2>ข้อเท็จจริงตามที่ทราบและเข้าใจ</h2>
    <p>${formatMultiline(draft.facts)}</p>
    <h2>${escapeHtml(labels.requestLabel)}</h2>
    <p>${formatMultiline(draft.requests)}</p>
    <h2>บัญชีข้อมูลและหลักฐาน</h2>
    ${evidence}
    <p class="notice">โปรดตรวจชื่อ วันเวลา ข้อเท็จจริง ข้อมูลบุคคลอื่น และคำขออีกครั้งก่อนส่ง เอกสารนี้ไม่ใช่คำวินิจฉัยทางกฎหมาย</p>
    ${decision === "complaint" ? `<div class="signature"><p>ลงชื่อ ................................................</p><p>(${nameText})</p></div>` : ""}
  </body></html>`;
}

export function ComplaintPackageBuilder({
  decision,
  agency,
  evidenceChecklist,
  draft,
  mode,
  consent,
  aiContext,
  onDraftChange,
  onBack,
  onContinue,
  onRequireConsent,
}: ComplaintPackageBuilderProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const labels = decisionLabels[decision];
  const needsIdentity = decision === "complaint";
  const isReady = draft.subject.trim().length >= 5
    && draft.facts.trim().length >= 20
    && draft.requests.trim().length >= 5
    && (!needsIdentity || (draft.name.trim().length >= 2 && draft.contact.trim().length >= 3));
  const grounding = [
    `ประเภทเอกสาร: ${labels.title}`,
    `ผู้รับเอกสาร: ${agency.name}`,
    `หน่วยงานทำได้: ${agency.canDo}`,
    `หน่วยงานทำไม่ได้: ${agency.cannotDo}`,
    `คำขอที่ผู้ใช้ระบุ: ${draft.requests || "ยังไม่ได้ระบุ"}`,
    ...evidenceChecklist.map((item) => `หลักฐานที่ควรพิจารณา: ${item}`),
  ];

  function updateDraft<Field extends keyof DocumentDraft>(field: Field, value: DocumentDraft[Field]) {
    onDraftChange({ ...draft, [field]: value });
  }

  function toggleEvidence(item: string) {
    updateDraft("selectedEvidence", draft.selectedEvidence.includes(item)
      ? draft.selectedEvidence.filter((selectedItem) => selectedItem !== item)
      : [...draft.selectedEvidence, item]);
  }

  function downloadDocument() {
    const html = buildDocumentHtml(decision, agency, draft);
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = decision === "complaint" ? "หนังสือร้องเรียน.doc" : decision === "consult" ? "สรุปขอคำปรึกษา.doc" : "แผนเตรียมข้อมูล.doc";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyDocument() {
    const plainText = [
      labels.title,
      decision === "prepare" ? "" : `เรียน ${agency.name}`,
      `เรื่อง ${draft.subject}`,
      `ชื่อ ${draft.name}`,
      `ติดต่อ ${draft.contact}`,
      "",
      "ข้อเท็จจริง",
      draft.facts,
      "",
      labels.requestLabel,
      draft.requests,
      "",
      "หลักฐาน",
      ...draft.selectedEvidence.map((item, index) => `${index + 1}. ${item}`),
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(plainText);
      setCopyStatus("คัดลอกข้อความแล้ว");
    } catch {
      setCopyStatus("คัดลอกอัตโนมัติไม่ได้ กรุณาดาวน์โหลดไฟล์แทน");
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 10 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">{labels.title}</h2>
        </div>
        <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">{labels.badge}</span>
      </div>

      <aside className="mt-7 border-l-4 border-river bg-[#e9f4f2] p-4 text-sm leading-6 text-ink">
        <strong className="block">ข้อมูลในแบบฟอร์มนี้อยู่ในหน่วยความจำของเบราว์เซอร์เท่านั้น</strong>
        ชื่อ ที่อยู่ และช่องทางติดต่อด้านล่างจะไม่ถูกส่งให้ AI และจะหายเมื่อปิดหรือโหลดหน้าใหม่
      </aside>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-ink">วันที่
          <input type="date" value={draft.date} onChange={(event) => updateDraft("date", event.target.value)} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-sm font-bold text-ink">ชื่อผู้จัดทำ/ผู้ร้อง {needsIdentity ? "*" : "(ไม่บังคับ)"}
          <input value={draft.name} onChange={(event) => updateDraft("name", event.target.value.slice(0, 120))} maxLength={120} autoComplete="off" className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-sm font-bold text-ink">ช่องทางติดต่อ {needsIdentity ? "*" : "(ไม่บังคับ)"}
          <input value={draft.contact} onChange={(event) => updateDraft("contact", event.target.value.slice(0, 160))} maxLength={160} autoComplete="off" placeholder="โทรศัพท์ อีเมล หรือวิธีที่ปลอดภัย" className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-sm font-bold text-ink">ที่อยู่หรือข้อมูลติดต่อเพิ่มเติม (ไม่บังคับ)
          <input value={draft.address} onChange={(event) => updateDraft("address", event.target.value.slice(0, 300))} maxLength={300} autoComplete="off" className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
        </label>
      </div>

      <label className="mt-5 block text-sm font-bold text-ink">เรื่อง/หัวข้อเอกสาร *
        <input value={draft.subject} onChange={(event) => updateDraft("subject", event.target.value.slice(0, 220))} maxLength={220} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" />
      </label>
      <label className="mt-5 block text-sm font-bold text-ink">ข้อเท็จจริงตามที่ทราบและเข้าใจ *
        <textarea value={draft.facts} onChange={(event) => updateDraft("facts", event.target.value.slice(0, 5000))} maxLength={5000} className="mt-2 min-h-56 w-full resize-y border border-line bg-white p-4 font-normal leading-7" />
      </label>
      <label className="mt-5 block text-sm font-bold text-ink">{labels.requestLabel} *
        <textarea value={draft.requests} onChange={(event) => updateDraft("requests", event.target.value.slice(0, 1800))} maxLength={1800} className="mt-2 min-h-36 w-full resize-y border border-line bg-white p-4 font-normal leading-7" />
      </label>

      <fieldset className="mt-6 border border-line p-5">
        <legend className="px-2 text-sm font-bold text-ink">บัญชีข้อมูลและหลักฐาน</legend>
        <p className="mb-4 text-xs leading-5 text-ink-soft">เลือกเฉพาะสิ่งที่มีหรือจะเตรียม ไม่มีเอกสารบางรายการก็ยังขอคำปรึกษาได้</p>
        <div className="grid gap-3">
          {evidenceChecklist.map((item) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink">
              <input type="checkbox" checked={draft.selectedEvidence.includes(item)} onChange={() => toggleEvidence(item)} className="mt-1 h-5 w-5 shrink-0 accent-river" />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <WorkflowAiAssistant
        stage="complaint"
        mode={mode}
        consent={consent}
        context={aiContext}
        grounding={grounding}
        buttonLabel="ให้ AI ช่วยตรวจและเรียบเรียงภาษา"
        onRequireConsent={onRequireConsent}
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={downloadDocument} disabled={!isReady} className="min-h-12 bg-river px-5 py-3 font-bold text-white hover:bg-ink disabled:cursor-not-allowed disabled:bg-[#b8c3c5]">ดาวน์โหลด Word (.doc)</button>
        <button type="button" onClick={() => void copyDocument()} disabled={!isReady} className="min-h-12 border border-river bg-white px-5 py-3 font-bold text-river disabled:cursor-not-allowed disabled:border-line disabled:text-[#86979b]">คัดลอกข้อความ</button>
        <button type="button" onClick={() => window.print()} disabled={!isReady} className="min-h-12 border border-line bg-white px-5 py-3 font-bold text-ink-soft disabled:cursor-not-allowed disabled:text-[#9aabad]">พิมพ์/บันทึก PDF</button>
      </div>
      {copyStatus && <p className="mt-3 text-sm font-bold text-river" role="status">{copyStatus}</p>}
      {!isReady && <p className="mt-3 text-xs leading-5 text-coral">กรอกหัวข้อ ข้อเท็จจริง และความต้องการให้ครบ{needsIdentity ? " รวมทั้งชื่อและช่องทางติดต่อ" : ""} ก่อนดาวน์โหลดหรือไปขั้นถัดไป</p>}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">← กลับไปเลือกทาง</button>
        <button type="button" onClick={onContinue} disabled={!isReady} className="min-h-12 bg-ink px-7 py-3 font-bold text-white hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]">ดูวิธีส่งและติดตาม →</button>
      </div>
    </>
  );
}
