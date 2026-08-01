import type { SuggestedRight } from "@/lib/rights-guidance";

type RightsGuidanceProps = {
  rights: SuggestedRight[];
  onBack: () => void;
  onContinue: () => void;
};

export function RightsGuidance({ rights, onBack, onContinue }: RightsGuidanceProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 4 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">สิทธิใดอาจเกี่ยวข้อง</h2>
        </div>
        <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">กฎที่ตรวจสอบแล้ว</span>
      </div>

      <div className="mt-7 border-l-4 border-saffron bg-[#fff8e8] p-5 text-sm leading-6 text-ink">
        <strong className="block">นี่เป็นข้อมูลเพื่อช่วยตั้งต้น ไม่ใช่คำวินิจฉัย</strong>
        ระบบจับคู่จากถ้อยคำในข้อเท็จจริงด้วยกฎในเครื่อง และใช้คำว่า “อาจเกี่ยวข้อง” เสมอ หน่วยงานหรือผู้เชี่ยวชาญยังต้องตรวจข้อเท็จจริงและกฎหมายเฉพาะอีกครั้ง
      </div>

      <div className="mt-7 grid gap-5">
        {rights.map((right, index) => (
          <article key={right.id} className="border border-line bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-river text-sm font-bold text-white" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold leading-7 text-ink">{right.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink">{right.plainLanguage}</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 border-t border-line pt-5 text-sm leading-6">
              <div>
                <dt className="font-bold text-river">เหตุผลที่ระบบแสดงข้อนี้</dt>
                <dd className="mt-1 text-ink-soft">{right.whyMatched}</dd>
              </div>
              <div>
                <dt className="font-bold text-coral">สิ่งที่ควรตรวจเพิ่ม</dt>
                <dd className="mt-1 text-ink-soft">{right.whatToCheck}</dd>
              </div>
            </dl>

            <div className="mt-5 bg-paper p-4">
              <p className="text-xs font-bold text-ink">แหล่งข้อมูลทางการ</p>
              <ul className="mt-2 space-y-2">
                {right.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="text-xs font-bold leading-5 text-river underline underline-offset-4">
                      {source.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.7rem] leading-5 text-ink-soft">ตรวจสอบข้อมูลล่าสุดเมื่อ {right.lastVerifiedAt}</p>
            </div>
          </article>
        ))}
      </div>

      <aside className="mt-7 border-l-4 border-river bg-[#e9f4f2] p-5 text-sm leading-6 text-ink">
        <strong className="block">เรื่องของคุณยังอยู่ในหน่วยความจำของหน้านี้เท่านั้น</strong>
        การจับคู่สิทธิทำในเบราว์เซอร์ ไม่ส่งเรื่องกลับไปหา AI และไม่บันทึกลงฐานข้อมูล
      </aside>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">
          ← กลับไปตรวจข้อเท็จจริง
        </button>
        <button type="button" onClick={onContinue} className="min-h-12 bg-ink px-7 py-3 font-bold text-white transition hover:bg-river">
          ดูทางเลือกที่ทำได้ →
        </button>
      </div>
    </>
  );
}
