import { WorkflowAiAssistant } from "@/components/workflow-ai-assistant";
import type { ActionOption } from "@/lib/action-options";
import type { AssistanceMode } from "@/lib/story-assistance";

type OptionComparisonProps = {
  options: ActionOption[];
  mode: AssistanceMode;
  consent: boolean;
  context: string;
  onBack: () => void;
  onContinue: () => void;
  onRequireConsent: () => void;
};

export function OptionComparison({ options, mode, consent, context, onBack, onContinue, onRequireConsent }: OptionComparisonProps) {
  const grounding = options.flatMap((option) => [
    `${option.title} ผลดี: ${option.benefit}`,
    `${option.title} ข้อจำกัด: ${option.limitation}`,
    `${option.title} ผลที่อาจตามมา: ${option.possibleOutcome}`,
    `${option.title} ใช้แรงและเวลา ${option.effort}; เปิดเผยข้อมูล ${option.disclosure}`,
  ]);

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 6 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">เปรียบเทียบก่อนตัดสินใจ</h2>
        </div>
        <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">ยังไม่ส่งเรื่อง</span>
      </div>

      <p className="mt-7 text-sm leading-7 text-ink-soft">
        ผลด้านล่างเป็นสิ่งที่อาจเกิดขึ้นโดยทั่วไป ไม่ใช่การรับรองผล หน่วยงานและสถานการณ์จริงอาจมีเงื่อนไขต่างกัน
      </p>

      <div className="mt-6 grid gap-5">
        {options.map((option, index) => (
          <article key={option.id} className="border border-line bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-river text-sm font-bold text-white">{index + 1}</span>
              <div>
                <h3 className="text-lg font-bold leading-7 text-ink">{option.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft"><b className="text-ink">เริ่มจาก:</b> {option.firstStep}</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 border-t border-line pt-5 text-sm leading-6 sm:grid-cols-2">
              <div className="border-l-4 border-river bg-[#e9f4f2] p-4">
                <dt className="font-bold text-river">ผลดีที่อาจได้รับ</dt>
                <dd className="mt-1 text-ink-soft">{option.benefit}</dd>
              </div>
              <div className="border-l-4 border-saffron bg-[#fff8e8] p-4">
                <dt className="font-bold text-[#7b5310]">ข้อจำกัดที่ควรรู้</dt>
                <dd className="mt-1 text-ink-soft">{option.limitation}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-ink">ผลที่อาจตามมา</dt>
                <dd className="mt-1 text-ink-soft">{option.possibleOutcome}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-paper px-3 py-1.5 text-ink">แรงและเวลาที่ใช้: {option.effort}</span>
              <span className="bg-paper px-3 py-1.5 text-ink">การเปิดเผยข้อมูล: {option.disclosure}</span>
            </div>
          </article>
        ))}
      </div>

      <WorkflowAiAssistant
        stage="comparison"
        mode={mode}
        consent={consent}
        context={context}
        grounding={grounding}
        buttonLabel="ให้ AI ช่วยเปรียบเทียบภาษาง่าย"
        onRequireConsent={onRequireConsent}
      />

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">
          ← กลับไปเลือกทาง
        </button>
        <button type="button" onClick={onContinue} className="min-h-12 bg-ink px-7 py-3 font-bold text-white transition hover:bg-river">
          ดูหน่วยงานที่ช่วยได้ →
        </button>
      </div>
    </>
  );
}
