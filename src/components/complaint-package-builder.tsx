"use client";

import { useState } from "react";
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
  agencyRequests: Record<string, string>;
  selectedEvidence: string[];
};

type ComplaintPackageBuilderProps = {
  decision: FinalDecision;
  agencies: SuggestedAgency[];
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

type AiComplaintDraft = {
  subject: string;
  facts: string;
  requestsByAgency: Array<{ agencyId: string; requests: string }>;
  reviewNotes: string[];
};

const decisionLabels: Record<FinalDecision, { title: string; badge: string; requestLabel: string }> = {
  complaint: { title: "สร้างหนังสือร้องเรียนและชุดพร้อมยื่น", badge: "สร้างแยกตามหน่วยงาน", requestLabel: "สิ่งที่ขอให้หน่วยงานดำเนินการ" },
  consult: { title: "สร้างสรุปเพื่อขอคำปรึกษา", badge: "ยังไม่ยื่นร้องเรียน", requestLabel: "คำถามหรือความช่วยเหลือที่ต้องการ" },
  prepare: { title: "สร้างแผนเก็บข้อมูลเพิ่ม", badge: "เก็บไว้กับคุณ", requestLabel: "เป้าหมายการเตรียมข้อมูล" },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function formatMultiline(value: string) {
  return escapeHtml(value).replace(/\n/gu, "<br>");
}

function displayDate(value: string) {
  if (!value) return "................................................";
  const [year, month, day] = value.split("-");
  const buddhistYear = Number(year) + 543;
  return day && month && Number.isFinite(buddhistYear) ? `${day}/${month}/${buddhistYear}` : value;
}

function buildLetter(decision: FinalDecision, agency: SuggestedAgency, draft: DocumentDraft, index: number) {
  const labels = decisionLabels[decision];
  const requestText = draft.agencyRequests[agency.id] || draft.requests;
  const evidence = draft.selectedEvidence.length > 0
    ? `<ol>${draft.selectedEvidence.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
    : "<p>ไม่มีเอกสารแนบในขณะจัดทำ</p>";
  const nameText = draft.name ? escapeHtml(draft.name) : "................................................";
  const contactText = draft.contact ? escapeHtml(draft.contact) : "................................................";
  const addressText = draft.address ? formatMultiline(draft.address) : "................................................";

  return `<article class="letter ${index > 0 ? "new-page" : ""}">
    <p class="right">วันที่ ${escapeHtml(displayDate(draft.date))}</p>
    <p><strong>เรื่อง</strong> ${escapeHtml(draft.subject || labels.title)}</p>
    ${decision === "prepare" ? "" : `<p><strong>เรียน</strong> ${escapeHtml(agency.name)}</p>`}
    <p><strong>สิ่งที่ส่งมาด้วย</strong></p>${evidence}
    <p>ข้าพเจ้า ${nameText}${draft.address ? ` อยู่ที่ ${addressText}` : ""} ช่องทางติดต่อ ${contactText} ขอ${decision === "complaint" ? "ร้องเรียนและขอให้ตรวจสอบ" : "ความช่วยเหลือ"}กรณีตามเรื่องข้างต้น โดยมีข้อเท็จจริงตามที่ข้าพเจ้าทราบและเข้าใจ ดังนี้</p>
    <h2>ข้อเท็จจริง</h2>
    <p>${formatMultiline(draft.facts)}</p>
    <h2>${escapeHtml(labels.requestLabel)}</h2>
    <p>${formatMultiline(requestText)}</p>
    ${decision === "complaint" ? "<p>ข้าพเจ้าขอรับรองว่าข้อมูลข้างต้นเป็นข้อเท็จจริงตามที่ข้าพเจ้าทราบและเข้าใจ และยินดีให้ข้อมูลหรือเอกสารเพิ่มเติมแก่เจ้าหน้าที่</p><p>จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการและแจ้งผลให้ข้าพเจ้าทราบ</p>" : ""}
    ${decision === "complaint" ? `<div class="signature"><p>ขอแสดงความนับถือ</p><p>ลงชื่อ ................................................</p><p>(${nameText})</p><p>ผู้ร้องเรียน</p></div>` : ""}
  </article>`;
}

function buildDocumentHtml(decision: FinalDecision, agencies: SuggestedAgency[], draft: DocumentDraft) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(decisionLabels[decision].title)}</title><style>
    @page{size:A4;margin:24mm 20mm} body{font-family:'Bai Jamjuree','Tahoma',sans-serif;font-size:16px;line-height:1.75;margin:0;color:#111}
    .letter{max-width:170mm;margin:0 auto}.new-page{break-before:page;page-break-before:always}.right{text-align:right}h2{font-size:16px;margin:22px 0 6px}p{margin:9px 0;text-align:justify}ol{margin-top:0;padding-left:28px}.signature{width:48%;margin:44px 0 0 auto;text-align:center}.signature p{text-align:center}
  </style></head><body>${agencies.map((agency, index) => buildLetter(decision, agency, draft, index)).join("")}</body></html>`;
}

export function ComplaintPackageBuilder({
  decision,
  agencies,
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
  const [aiError, setAiError] = useState("");
  const [aiNotice, setAiNotice] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<string[]>([]);
  const labels = decisionLabels[decision];
  const needsIdentity = decision === "complaint";
  const hasEveryAgencyRequest = agencies.every((agency) => (draft.agencyRequests[agency.id] || draft.requests).trim().length >= 5);
  const isReady = draft.subject.trim().length >= 5
    && draft.facts.trim().length >= 20
    && hasEveryAgencyRequest
    && (!needsIdentity || (draft.date.length > 0 && draft.name.trim().length >= 2 && draft.contact.trim().length >= 3));

  function updateDraft<Field extends keyof DocumentDraft>(field: Field, value: DocumentDraft[Field]) {
    onDraftChange({ ...draft, [field]: value });
  }

  function updateAgencyRequest(agencyId: string, value: string) {
    updateDraft("agencyRequests", { ...draft.agencyRequests, [agencyId]: value });
  }

  function toggleEvidence(item: string) {
    updateDraft("selectedEvidence", draft.selectedEvidence.includes(item)
      ? draft.selectedEvidence.filter((selectedItem) => selectedItem !== item)
      : [...draft.selectedEvidence, item]);
  }

  async function createAiDraft() {
    if (!consent) {
      onRequireConsent();
      return;
    }
    if (!navigator.onLine) {
      setAiError("ไม่มีอินเทอร์เน็ต จึงยังใช้ร่างจากข้อเท็จจริงในเครื่องต่อได้");
      return;
    }

    setAiError("");
    setAiNotice("");
    setIsDrafting(true);
    try {
      const response = await fetch("/api/ai/complaint-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: aiContext,
          currentSubject: draft.subject,
          currentFacts: draft.facts,
          desiredOutcome: draft.requests,
          evidence: evidenceChecklist,
          agencies: agencies.map((agency) => ({ id: agency.id, name: agency.name, canDo: agency.canDo, cannotDo: agency.cannotDo })),
          consent: true,
        }),
        cache: "no-store",
      });
      const payload = (await response.json()) as { data?: AiComplaintDraft; error?: string; meta?: { usedRuleFallback?: boolean } };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "AI ยังสร้างร่างไม่ได้");
      const agencyRequests = Object.fromEntries(payload.data.requestsByAgency.map((item) => [item.agencyId, item.requests]));
      onDraftChange({ ...draft, subject: payload.data.subject, facts: payload.data.facts, agencyRequests });
      setReviewNotes(payload.data.reviewNotes);
      setAiNotice(payload.meta?.usedRuleFallback
        ? "AI ตอบไม่ครบรูปแบบ ระบบจึงนำข้อเท็จจริงที่คุณให้มาประกอบเป็นร่างสำรองให้แล้ว กรุณาตรวจทานก่อนยื่น"
        : "AI จัดลำดับข้อเท็จจริงและเขียนคำขอแยกตามหน่วยงานให้แล้ว กรุณาตรวจทานก่อนยื่น");
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI ยังสร้างร่างไม่ได้ กรุณาตรวจแก้ร่างในเครื่อง");
    } finally {
      setIsDrafting(false);
    }
  }

  function downloadDocument() {
    const html = buildDocumentHtml(decision, agencies, draft);
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = decision === "complaint" ? `ชุดหนังสือร้องเรียน-${agencies.length}-หน่วยงาน.doc` : decision === "consult" ? "สรุปขอคำปรึกษา.doc" : "แผนเตรียมข้อมูล.doc";
    link.click();
    URL.revokeObjectURL(url);
  }

  function printDocument() {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.opacity = "0";
    document.body.appendChild(frame);
    frame.contentDocument?.write(buildDocumentHtml(decision, agencies, draft));
    frame.contentDocument?.close();
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 1000);
  }

  async function copyDocument() {
    const plainText = agencies.map((agency) => [
      `วันที่ ${displayDate(draft.date)}`,
      `เรื่อง ${draft.subject}`,
      decision === "prepare" ? "" : `เรียน ${agency.name}`,
      `ชื่อผู้ร้อง ${draft.name}`,
      `ติดต่อ ${draft.contact}`,
      "",
      "ข้อเท็จจริง",
      draft.facts,
      "",
      labels.requestLabel,
      draft.agencyRequests[agency.id] || draft.requests,
      "",
      "สิ่งที่ส่งมาด้วย",
      ...draft.selectedEvidence.map((item, index) => `${index + 1}. ${item}`),
    ].filter(Boolean).join("\n")).join("\n\n----------------------------------------\n\n");

    try {
      await navigator.clipboard.writeText(plainText);
      setCopyStatus(`คัดลอกหนังสือ ${agencies.length} ฉบับแล้ว`);
    } catch {
      setCopyStatus("คัดลอกอัตโนมัติไม่ได้ กรุณาดาวน์โหลดไฟล์แทน");
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div><p className="text-sm font-bold text-river">ขั้นที่ 10 จาก 11</p><h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">{labels.title}</h2></div>
        <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">{labels.badge}</span>
      </div>

      <aside className="mt-7 border-l-4 border-river bg-[#e9f4f2] p-4 text-sm leading-6 text-ink">
        <strong className="block">ชื่อ ที่อยู่ และช่องทางติดต่ออยู่ในเบราว์เซอร์เท่านั้น</strong>
        ข้อมูลระบุตัวบุคคลด้านล่างไม่ถูกส่งให้ AI ระบบจะสร้างหนังสือแยก {agencies.length} ฉบับสำหรับ {agencies.map((agency) => agency.name).join(" และ ")}
      </aside>

      {mode === "ai" && (
        <section className="mt-6 border-t-4 border-saffron bg-[#fffaf0] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold tracking-[0.12em] text-coral">AI สร้างร่างที่นำไปใช้ต่อได้</p><p className="mt-1 text-sm leading-6 text-ink-soft">AI จะเรียงข้อเท็จจริงและเขียนคำขอแยกตามอำนาจของแต่ละหน่วยงาน แล้วใส่ผลลงในช่องหนังสือให้ตรวจแก้</p></div>
            <button type="button" onClick={() => void createAiDraft()} disabled={isDrafting} className="min-h-12 shrink-0 bg-ink px-5 py-3 font-bold text-white hover:bg-river disabled:bg-[#b8c3c5]">{isDrafting ? "กำลังสร้างร่าง…" : "ให้ AI สร้างร่างหนังสือ"}</button>
          </div>
          {aiError && <p className="mt-4 border-l-4 border-coral bg-white p-3 text-sm leading-6 text-ink" role="alert">{aiError}</p>}
          {aiNotice && <p className="mt-4 border-l-4 border-river bg-white p-3 text-sm leading-6 text-ink" role="status">{aiNotice}</p>}
          {reviewNotes.length > 0 && <div className="mt-4 border border-line bg-white p-4"><p className="text-sm font-bold text-ink">จุดที่ต้องตรวจด้วยตนเองก่อนยื่น</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">{reviewNotes.map((note) => <li key={note}>{note}</li>)}</ul></div>}
        </section>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-ink">วันที่ {needsIdentity ? "*" : ""}<input type="date" value={draft.date} onChange={(event) => updateDraft("date", event.target.value)} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" /></label>
        <label className="text-sm font-bold text-ink">ชื่อผู้จัดทำ/ผู้ร้อง {needsIdentity ? "*" : "(ไม่บังคับ)"}<input value={draft.name} onChange={(event) => updateDraft("name", event.target.value.slice(0, 120))} maxLength={120} autoComplete="off" className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" /></label>
        <label className="text-sm font-bold text-ink">ช่องทางติดต่อ {needsIdentity ? "*" : "(ไม่บังคับ)"}<input value={draft.contact} onChange={(event) => updateDraft("contact", event.target.value.slice(0, 160))} maxLength={160} autoComplete="off" placeholder="โทรศัพท์ อีเมล หรือวิธีที่ปลอดภัย" className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" /></label>
        <label className="text-sm font-bold text-ink">ที่อยู่หรือข้อมูลติดต่อเพิ่มเติม (ไม่บังคับ)<input value={draft.address} onChange={(event) => updateDraft("address", event.target.value.slice(0, 300))} maxLength={300} autoComplete="off" className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" /></label>
      </div>

      <label className="mt-5 block text-sm font-bold text-ink">เรื่อง/หัวข้อเอกสาร *<input value={draft.subject} onChange={(event) => updateDraft("subject", event.target.value)} className="mt-2 min-h-12 w-full border border-line bg-white px-4 py-3 font-normal" /></label>
      <label className="mt-5 block text-sm font-bold text-ink">ข้อเท็จจริงตามลำดับเหตุการณ์ *<textarea value={draft.facts} onChange={(event) => updateDraft("facts", event.target.value)} className="mt-2 min-h-64 w-full resize-y border border-line bg-white p-4 font-normal leading-7" /></label>

      <div className="mt-6 grid gap-4">
        {agencies.map((agency) => (
          <label key={agency.id} className="block border border-line bg-white p-5 text-sm font-bold text-ink">
            {labels.requestLabel} — {agency.name} *
            <span className="mt-1 block text-xs font-normal leading-5 text-ink-soft">หน่วยงานนี้ช่วยได้: {agency.canDo}</span>
            <textarea value={draft.agencyRequests[agency.id] || draft.requests} onChange={(event) => updateAgencyRequest(agency.id, event.target.value)} className="mt-3 min-h-40 w-full resize-y border border-line bg-[#fbfcfa] p-4 font-normal leading-7" />
          </label>
        ))}
      </div>

      <fieldset className="mt-6 border border-line p-5">
        <legend className="px-2 text-sm font-bold text-ink">สิ่งที่ส่งมาด้วย</legend>
        <p className="mb-4 text-xs leading-5 text-ink-soft">เลือกเฉพาะเอกสารที่มีจริง เอกสารจะถูกใส่ในบัญชีสิ่งที่ส่งมาด้วยของหนังสือทุกฉบับ</p>
        <div className="grid gap-3">{evidenceChecklist.map((item) => <label key={item} className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink"><input type="checkbox" checked={draft.selectedEvidence.includes(item)} onChange={() => toggleEvidence(item)} className="mt-1 h-5 w-5 shrink-0 accent-river" />{item}</label>)}</div>
      </fieldset>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={downloadDocument} disabled={!isReady} className="min-h-12 bg-river px-5 py-3 font-bold text-white hover:bg-ink disabled:bg-[#b8c3c5]">ดาวน์โหลด Word {agencies.length} ฉบับ</button>
        <button type="button" onClick={() => void copyDocument()} disabled={!isReady} className="min-h-12 border border-river bg-white px-5 py-3 font-bold text-river disabled:border-line disabled:text-[#86979b]">คัดลอกข้อความ</button>
        <button type="button" onClick={printDocument} disabled={!isReady} className="min-h-12 border border-line bg-white px-5 py-3 font-bold text-ink-soft disabled:text-[#9aabad]">พิมพ์/บันทึก PDF</button>
      </div>
      {copyStatus && <p className="mt-3 text-sm font-bold text-river" role="status">{copyStatus}</p>}
      {!isReady && <p className="mt-3 text-xs leading-5 text-coral">ตรวจหัวข้อ ข้อเท็จจริง คำขอของทุกหน่วยงาน{needsIdentity ? " วันที่ ชื่อ และช่องทางติดต่อ" : ""} ให้ครบก่อนดาวน์โหลด</p>}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">← กลับไปเลือกทาง</button>
        <button type="button" onClick={onContinue} disabled={!isReady} className="min-h-12 bg-ink px-7 py-3 font-bold text-white hover:bg-river disabled:bg-[#b8c3c5]">ดูช่องทางส่งทุกหน่วยงาน →</button>
      </div>
    </>
  );
}
