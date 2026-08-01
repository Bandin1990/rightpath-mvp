import type { ActionOption, ActionOptionId } from "@/lib/action-options";

type ActionOptionsGuidanceProps = {
  options: ActionOption[];
  selectedIds: ActionOptionId[];
  onToggle: (optionId: ActionOptionId) => void;
  onBack: () => void;
  onCompare: () => void;
};

export function ActionOptionsGuidance({ options, selectedIds, onToggle, onBack, onCompare }: ActionOptionsGuidanceProps) {
  const selectedIdSet = new Set(selectedIds);

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className="text-sm font-bold text-river">ขั้นที่ 5 จาก 11</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">คุณมีทางเลือกอะไรบ้าง</h2>
        </div>
        <span className="shrink-0 bg-[#fff2d5] px-3 py-1.5 text-xs font-bold text-[#7b5310]">คุณเป็นคนเลือก</span>
      </div>

      <div className="mt-7 border-l-4 border-river bg-[#e9f4f2] p-5 text-sm leading-6 text-ink">
        <strong className="block">ไม่จำเป็นต้องเริ่มจากการร้องเรียนเสมอไป</strong>
        เลือกได้มากกว่าหนึ่งทาง ระบบจะนำทางที่เลือกไปเปรียบเทียบผลดี ข้อจำกัด และสิ่งที่อาจเกิดขึ้นในขั้นถัดไป
      </div>

      <fieldset className="mt-7">
        <legend className="text-base font-bold text-ink">เลือกทางที่คุณอยากพิจารณา</legend>
        <p className="mt-1 text-xs leading-5 text-ink-soft">การเลือกตรงนี้ยังไม่ส่งเรื่อง ไม่ติดต่อหน่วยงาน และไม่ถูกบันทึก</p>
        <div className="mt-5 grid gap-4">
          {options.map((option) => {
            const isSelected = selectedIdSet.has(option.id);

            return (
              <label key={option.id} className={`cursor-pointer border p-5 transition ${isSelected ? "border-river bg-[#e9f4f2]" : "border-line bg-white hover:border-river"}`}>
                <span className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(option.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-river"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-start justify-between gap-2">
                      <strong className="text-base leading-7 text-ink">{option.title}</strong>
                      {option.recommendedReason && <span className="bg-saffron px-2 py-1 text-[0.7rem] font-bold text-ink">ควรพิจารณา</span>}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-ink-soft">{option.summary}</span>
                    {option.recommendedReason && <span className="mt-3 block border-l-2 border-saffron pl-3 text-xs leading-5 text-ink">{option.recommendedReason}</span>}
                    <span className="mt-3 block text-xs leading-5 text-ink-soft"><b className="text-ink">เหมาะเมื่อ:</b> {option.suitableWhen}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <aside className="mt-7 border-l-4 border-river bg-[#e9f4f2] p-5 text-sm leading-6 text-ink">
        <strong className="block">ข้อมูลยังอยู่ในหน่วยความจำของหน้านี้เท่านั้น</strong>
        การเลือกทางทำในเบราว์เซอร์ ไม่ส่งกลับไปหา AI และจะหายเมื่อปิดหรือโหลดหน้าใหม่
      </aside>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">
          ← กลับไปดูสิทธิ
        </button>
        <button
          type="button"
          onClick={onCompare}
          disabled={selectedIds.length === 0}
          className="min-h-12 bg-ink px-7 py-3 font-bold text-white transition hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]"
        >
          {selectedIds.length === 0 ? "เลือกอย่างน้อย 1 ทาง" : `เปรียบเทียบ ${selectedIds.length} ทางเลือก →`}
        </button>
      </div>
    </>
  );
}
