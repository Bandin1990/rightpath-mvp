"use client";

import { WorkflowAiAssistant } from "@/components/workflow-ai-assistant";
import type { AssistanceMode } from "@/lib/story-assistance";
import type { RiskAssessment } from "@/lib/workflow-guidance";

type RiskGuidanceProps = {
  risks: RiskAssessment[];
  acknowledgedRiskIds: string[];
  mode: AssistanceMode;
  consent: boolean;
  context: string;
  onToggleAcknowledgement: (riskId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onRequireConsent: () => void;
};

const severityLabels = {
  low: "ยังไม่พบสัญญาณชัด",
  caution: "ควรระมัดระวัง",
  seek_help_first: "ควรขอความช่วยเหลือก่อน",
} as const;

export function RiskGuidance({
  risks,
  acknowledgedRiskIds,
  mode,
  consent,
  context,
  onToggleAcknowledgement,
  onBack,
  onContinue,
  onRequireConsent,
}: RiskGuidanceProps) {
  const importantRisks = risks.filter((risk) => risk.severity !== "low");
  const acknowledgedImportantCount = importantRisks.filter((risk) => acknowledgedRiskIds.includes(risk.id)).length;
  const canContinue = acknowledgedImportantCount === importantRisks.length;
  const grounding = risks.flatMap((risk) => [
    `${risk.title}: ${severityLabels[risk.severity]} — ${risk.explanation}`,
    `วิธีลดความเสี่ยง ${risk.title}: ${risk.mitigation}`,
  ]);

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 8 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">ประเมินความเสี่ยงและวิธีลด</h2>
        </div>
        <span className="shrink-0 bg-[#fff2d5] px-3 py-1.5 text-xs font-bold text-[#7b5310]">อ่านก่อนตัดสินใจ</span>
      </div>

      <p className="mt-7 text-sm leading-6 text-ink-soft">ผลนี้เป็นการเตือนจากกฎ ไม่ใช่การทำนายว่าจะเกิดเหตุแน่นอน กรุณาติ๊กยืนยันเฉพาะข้อที่ควรระมัดระวังหรือควรขอความช่วยเหลือก่อน</p>

      <div className="mt-6 grid gap-4">
        {risks.map((risk) => {
          const requiresAcknowledgement = risk.severity !== "low";
          const isAcknowledged = acknowledgedRiskIds.includes(risk.id);
          return (
            <article key={risk.id} className={`border-l-4 p-5 ${risk.severity === "seek_help_first" ? "border-coral bg-[#fff0ed]" : risk.severity === "caution" ? "border-saffron bg-[#fff8e8]" : "border-river bg-[#e9f4f2]"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-ink">{risk.title}</h3>
                <span className="bg-white px-2 py-1 text-xs font-bold text-ink-soft">{severityLabels[risk.severity]}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink">{risk.explanation}</p>
              <p className="mt-3 text-sm leading-6 text-ink-soft"><strong className="text-river">วิธีลดความเสี่ยง:</strong> {risk.mitigation}</p>
              <p className="mt-3 text-xs leading-5 text-ink-soft">
                ตรวจสอบล่าสุด {risk.lastVerifiedAt} · <a href={risk.source.url} target="_blank" rel="noreferrer" className="font-bold text-river underline underline-offset-4">{risk.source.label}</a>
              </p>
              {requiresAcknowledgement && (
                <label className="mt-4 flex cursor-pointer items-start gap-3 border border-white bg-white p-3 text-sm font-bold leading-6 text-ink">
                  <input type="checkbox" checked={isAcknowledged} onChange={() => onToggleAcknowledgement(risk.id)} className="mt-1 h-5 w-5 shrink-0 accent-river" />
                  ฉันอ่านความเสี่ยงและวิธีลดข้อนี้แล้ว
                </label>
              )}
            </article>
          );
        })}
      </div>

      <WorkflowAiAssistant
        stage="risks"
        mode={mode}
        consent={consent}
        context={context}
        grounding={grounding}
        buttonLabel="ให้ AI ช่วยจัดลำดับสิ่งที่ควรระวัง"
        onRequireConsent={onRequireConsent}
      />

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">← กลับไปเลือกหน่วยงาน</button>
        <button type="button" onClick={onContinue} disabled={!canContinue} className="min-h-12 bg-ink px-7 py-3 font-bold text-white hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]">
          {canContinue ? "เลือกว่าจะไปต่ออย่างไร →" : `อ่านและยืนยันอีก ${importantRisks.length - acknowledgedImportantCount} ข้อ`}
        </button>
      </div>
    </>
  );
}
