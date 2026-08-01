"use client";

import { WorkflowAiAssistant } from "@/components/workflow-ai-assistant";
import type { AssistanceMode } from "@/lib/story-assistance";
import type { SuggestedAgency } from "@/lib/workflow-guidance";

type AgencyGuidanceProps = {
  agencies: SuggestedAgency[];
  selectedAgencyId: string | null;
  mode: AssistanceMode;
  consent: boolean;
  context: string;
  onSelect: (agencyId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onRequireConsent: () => void;
};

export function AgencyGuidance({
  agencies,
  selectedAgencyId,
  mode,
  consent,
  context,
  onSelect,
  onBack,
  onContinue,
  onRequireConsent,
}: AgencyGuidanceProps) {
  const grounding = agencies.flatMap((agency) => [
    `${agency.rank}: ${agency.name} — ${agency.reason}`,
    `${agency.name} ทำได้: ${agency.canDo}`,
    `${agency.name} ทำไม่ได้: ${agency.cannotDo}`,
    ...agency.channels.map((channel) => `${agency.name} ช่องทาง: ${channel.label}${channel.detail ? ` (${channel.detail})` : ""}`),
  ]);

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 7 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">หน่วยงานใดช่วยเรื่องใดได้</h2>
        </div>
        <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">แสดงเฉพาะที่ตรงที่สุด</span>
      </div>

      <p className="mt-7 text-sm leading-6 text-ink-soft">
        ระบบแสดงไม่เกิน 3 หน่วยงานจากกฎที่ตรวจสอบแล้ว เลือกหนึ่งแห่งเพื่อใช้เป็นผู้รับเอกสารหลัก คุณยังเปลี่ยนภายหลังได้ก่อนดาวน์โหลด
      </p>

      <fieldset className="mt-6 grid gap-4">
        <legend className="sr-only">เลือกหน่วยงานหลัก</legend>
        {agencies.map((agency) => {
          const isSelected = agency.id === selectedAgencyId;
          return (
            <label key={agency.id} className={`cursor-pointer border p-5 transition ${isSelected ? "border-river bg-[#e9f4f2]" : "border-line bg-white hover:border-river"}`}>
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="selected-agency"
                  value={agency.id}
                  checked={isSelected}
                  onChange={() => onSelect(agency.id)}
                  className="mt-1 h-5 w-5 shrink-0 accent-river"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-lg leading-7 text-ink">{agency.name}</strong>
                    <span className="bg-ink px-2 py-1 text-[0.7rem] font-bold text-white">{agency.rank}</span>
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-6 text-river">{agency.reason}</span>
                  <span className="mt-2 block text-sm leading-6 text-ink-soft">{agency.summary}</span>
                </span>
              </span>

              <dl className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-river">ช่วยอะไรได้</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink">{agency.canDo}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-coral">ช่วยอะไรไม่ได้หรือมีข้อจำกัด</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink">{agency.cannotDo}</dd>
                </div>
              </dl>

              <span className="mt-4 flex flex-wrap gap-2">
                {agency.channels.map((channel) => (
                  <a
                    key={`${agency.id}-${channel.label}`}
                    href={channel.href}
                    target={channel.type === "website" ? "_blank" : undefined}
                    rel={channel.type === "website" ? "noreferrer" : undefined}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex min-h-10 items-center border border-river bg-white px-3 py-2 text-sm font-bold text-river no-underline"
                  >
                    {channel.type === "phone" ? "☎ " : ""}{channel.label}
                  </a>
                ))}
              </span>
              <span className="mt-3 block text-xs leading-5 text-ink-soft">
                ตรวจสอบล่าสุด {agency.lastVerifiedAt} · <a href={agency.source.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="font-bold text-river underline underline-offset-4">{agency.source.label}</a>
              </span>
            </label>
          );
        })}
      </fieldset>

      <WorkflowAiAssistant
        stage="agencies"
        mode={mode}
        consent={consent}
        context={context}
        grounding={grounding}
        buttonLabel="ให้ AI ช่วยอธิบายหน่วยงาน"
        onRequireConsent={onRequireConsent}
      />

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">← กลับไปเปรียบเทียบทางเลือก</button>
        <button type="button" onClick={onContinue} disabled={!selectedAgencyId} className="min-h-12 bg-ink px-7 py-3 font-bold text-white hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]">
          {selectedAgencyId ? "ประเมินความเสี่ยง →" : "เลือกหน่วยงานหลักก่อน"}
        </button>
      </div>
    </>
  );
}
