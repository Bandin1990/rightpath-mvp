"use client";

import type { Ref } from "react";
import type { AssistanceMode } from "@/lib/story-assistance";

type AssistanceModeSelectorProps = {
  mode: AssistanceMode;
  consent: boolean;
  consentRef?: Ref<HTMLInputElement>;
  showConsentError?: boolean;
  onModeChange: (mode: AssistanceMode) => void;
  onConsentChange: (consent: boolean) => void;
};

export function AssistanceModeSelector({
  mode,
  consent,
  consentRef,
  showConsentError = false,
  onModeChange,
  onConsentChange,
}: AssistanceModeSelectorProps) {
  return (
    <fieldset className="mb-7 border border-line bg-paper p-4 sm:p-5">
      <legend className="px-2 text-sm font-bold text-ink">โหมดช่วยประมวลผลทุกขั้น</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={`cursor-pointer border p-4 ${mode === "rules" ? "border-river bg-[#e9f4f2]" : "border-line bg-white"}`}>
          <span className="flex items-start gap-3">
            <input
              type="radio"
              name="global-assistance-mode"
              value="rules"
              checked={mode === "rules"}
              onChange={() => onModeChange("rules")}
              className="mt-1 h-4 w-4 accent-river"
            />
            <span>
              <strong className="block text-sm text-ink">ใช้กฎในเครื่อง</strong>
              <span className="mt-1 block text-xs leading-5 text-ink-soft">ใช้ต่อได้เมื่อออฟไลน์ ไม่ส่งเรื่องให้ AI และกฎที่ตรวจสอบแล้วเป็นผู้ให้ผลหลัก</span>
            </span>
          </span>
        </label>
        <label className={`cursor-pointer border p-4 ${mode === "ai" ? "border-saffron bg-[#fff8e8]" : "border-line bg-white"}`}>
          <span className="flex items-start gap-3">
            <input
              type="radio"
              name="global-assistance-mode"
              value="ai"
              checked={mode === "ai"}
              onChange={() => onModeChange("ai")}
              className="mt-1 h-4 w-4 accent-river"
            />
            <span>
              <strong className="block text-sm text-ink">ใช้ AI ช่วยทุกขั้น</strong>
              <span className="mt-1 block text-xs leading-5 text-ink-soft">AI ช่วยถาม สรุป อธิบาย และร่างภาษา แต่เปลี่ยนผลสิทธิ หน่วยงาน หรือความเสี่ยงจากกฎไม่ได้</span>
            </span>
          </span>
        </label>
      </div>

      {mode === "ai" && (
        <label className={`mt-4 flex cursor-pointer items-start gap-3 border-l-4 p-4 text-xs leading-5 text-ink ${showConsentError ? "border-coral bg-[#fff0ed]" : "border-saffron bg-white"}`}>
          <input
            ref={consentRef}
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsentChange(event.target.checked)}
            aria-describedby={showConsentError ? "global-ai-consent global-ai-consent-error" : "global-ai-consent"}
            className="mt-1 h-4 w-4 shrink-0 accent-river"
          />
          <span>
            <span id="global-ai-consent">
              ฉันยินยอมให้ส่งเฉพาะข้อความและผลกฎที่จำเป็นไปยัง Cloudflare Workers AI เพื่อประมวลผลชั่วคราว แอปไม่บันทึกลงฐานข้อมูล และฉันจะไม่ใส่เลขบัตร รหัสผ่าน เลขบัญชี หรือข้อมูลเกินจำเป็น
            </span>
            {showConsentError && (
              <strong id="global-ai-consent-error" role="alert" className="mt-2 block text-sm text-coral">
                กรุณาติ๊กช่องยินยอมก่อนใช้ปุ่ม AI
              </strong>
            )}
          </span>
        </label>
      )}
    </fieldset>
  );
}
