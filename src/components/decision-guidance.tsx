"use client";

import { WorkflowAiAssistant } from "@/components/workflow-ai-assistant";
import type { AssistanceMode } from "@/lib/story-assistance";
import { finalDecisionOptions, type FinalDecision, type SuggestedAgency } from "@/lib/workflow-guidance";

type DecisionGuidanceProps = {
  decision: FinalDecision | null;
  agency: SuggestedAgency;
  mode: AssistanceMode;
  consent: boolean;
  context: string;
  onSelect: (decision: FinalDecision) => void;
  onBack: () => void;
  onContinue: () => void;
  onRequireConsent: () => void;
};

export function DecisionGuidance({ decision, agency, mode, consent, context, onSelect, onBack, onContinue, onRequireConsent }: DecisionGuidanceProps) {
  const grounding = [
    `หน่วยงานที่เลือก: ${agency.name}`,
    ...finalDecisionOptions.flatMap((option) => [`${option.title}: ${option.description}`, `ผลลัพธ์ถัดไป: ${option.nextResult}`]),
  ];

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 9 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">คุณเลือกว่าจะไปต่อแบบใด</h2>
        </div>
        <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">คุณเป็นผู้ตัดสินใจ</span>
      </div>

      <p className="mt-7 text-sm leading-6 text-ink-soft">ไม่มีคำตอบที่เหมาะกับทุกคน เลือกหนึ่งทางตามความพร้อมของคุณ ระบบจะสร้างชุดเอกสารให้ตรงกับทางนั้น โดยยังไม่ส่งเรื่องอัตโนมัติ</p>

      <fieldset className="mt-6 grid gap-4">
        <legend className="sr-only">เลือกทางไปต่อ</legend>
        {finalDecisionOptions.map((option) => {
          const isSelected = decision === option.id;
          return (
            <label key={option.id} className={`cursor-pointer border p-5 ${isSelected ? "border-river bg-[#e9f4f2]" : "border-line bg-white hover:border-river"}`}>
              <span className="flex items-start gap-3">
                <input type="radio" name="final-decision" value={option.id} checked={isSelected} onChange={() => onSelect(option.id)} className="mt-1 h-5 w-5 shrink-0 accent-river" />
                <span>
                  <strong className="block text-lg leading-7 text-ink">{option.title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-ink-soft">{option.description}</span>
                  <span className="mt-3 block border-l-4 border-saffron pl-3 text-sm font-bold leading-6 text-ink">{option.nextResult}</span>
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <WorkflowAiAssistant
        stage="decision"
        mode={mode}
        consent={consent}
        context={context}
        grounding={grounding}
        buttonLabel="ให้ AI ช่วยทบทวนก่อนเลือก"
        onRequireConsent={onRequireConsent}
      />

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">← กลับไปดูความเสี่ยง</button>
        <button type="button" onClick={onContinue} disabled={!decision} className="min-h-12 bg-ink px-7 py-3 font-bold text-white hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]">
          {decision ? "สร้างชุดเอกสารของฉัน →" : "เลือกทางไปต่อก่อน"}
        </button>
      </div>
    </>
  );
}
