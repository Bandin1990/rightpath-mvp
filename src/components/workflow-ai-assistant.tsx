"use client";

import { useState } from "react";
import type { AssistanceMode } from "@/lib/story-assistance";

export type WorkflowAiStage = "emergency" | "rights" | "options" | "comparison" | "agencies" | "risks" | "decision" | "complaint" | "submission";

export type WorkflowAiResult = {
  title: string;
  explanation: string;
  suggestions: string[];
  caution: string;
};

type WorkflowAiAssistantProps = {
  stage: WorkflowAiStage;
  mode: AssistanceMode;
  consent: boolean;
  context: string;
  grounding: string[];
  buttonLabel?: string;
  onRequireConsent: () => void;
  onResult?: (result: WorkflowAiResult) => void;
};

export function WorkflowAiAssistant({
  stage,
  mode,
  consent,
  context,
  grounding,
  buttonLabel = "ให้ AI ช่วยอธิบายขั้นนี้",
  onRequireConsent,
  onResult,
}: WorkflowAiAssistantProps) {
  const [result, setResult] = useState<WorkflowAiResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function requestAssistance() {
    if (!consent) {
      onRequireConsent();
      return;
    }

    if (!navigator.onLine) {
      setError("ขณะนี้ไม่มีอินเทอร์เน็ต ขั้นนี้ยังใช้ผลจากกฎในเครื่องต่อได้");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/workflow-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, context, grounding, consent: true }),
        cache: "no-store",
      });
      const payload = (await response.json()) as { data?: WorkflowAiResult; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "AI ยังไม่พร้อมใช้งาน");
      setResult(payload.data);
      onResult?.(payload.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI ยังไม่พร้อมใช้งาน ขั้นนี้ยังใช้ผลจากกฎในเครื่องต่อได้");
    } finally {
      setIsLoading(false);
    }
  }

  if (mode === "rules") {
    return (
      <aside className="mt-6 border-l-4 border-river bg-[#e9f4f2] p-4 text-xs leading-5 text-ink-soft">
        ขั้นนี้ใช้กฎที่ตรวจสอบแล้วในเบราว์เซอร์และไม่ส่งเรื่องออกจากเครื่อง หากต้องการให้ AI ช่วยอธิบาย ให้เลือก “ใช้ AI ช่วยทุกขั้น” จากกรอบด้านบน
      </aside>
    );
  }

  return (
    <section className="mt-6 border-t-4 border-saffron bg-[#fffaf0] p-5" aria-label="AI ช่วยประมวลผลขั้นนี้">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-coral">AI ช่วย — ผลกฎยังเป็นหลัก</p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">AI จะใช้เฉพาะข้อเท็จจริงและผลกฎที่แสดงในขั้นนี้ ไม่สามารถเพิ่มสิทธิ หน่วยงาน เบอร์โทร หรือกำหนดเวลาเอง</p>
        </div>
        <button
          type="button"
          onClick={() => void requestAssistance()}
          disabled={isLoading || context.trim().length === 0 || grounding.length === 0}
          className="min-h-11 shrink-0 bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]"
        >
          {isLoading ? "AI กำลังช่วย…" : buttonLabel}
        </button>
      </div>

      {error && <p className="mt-4 border-l-4 border-coral bg-white p-3 text-sm leading-6 text-ink" role="alert">{error}</p>}
      {result && (
        <div className="mt-5 border border-line bg-white p-5" aria-live="polite">
          <h3 className="text-lg font-bold text-ink">{result.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">{result.explanation}</p>
          {result.suggestions.length > 0 && (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
              {result.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
            </ul>
          )}
          <p className="mt-4 border-l-4 border-saffron bg-[#fff8e8] p-3 text-xs leading-5 text-ink-soft">{result.caution}</p>
        </div>
      )}
    </section>
  );
}
