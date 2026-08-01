"use client";

import { useEffect, useRef, useState } from "react";
import {
  emergencyContacts,
  emergencySourceCheckedAt,
  fallbackEmergencyContactIds,
  urgentThreatGroups,
  type EmergencyCatalog,
} from "@/lib/emergency-guidance";
import { classifyEmergencyText, emergencyThreatKeywords } from "@/lib/emergency-classifier";

const isStaticPublicDemo = process.env.NEXT_PUBLIC_STATIC_PUBLIC_DEMO === "true";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = Event & { error: string };

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

const steps = [
  { label: "ตรวจเหตุเร่งด่วน", note: "ความปลอดภัยต้องมาก่อน" },
  { label: "เล่าปัญหาด้วยภาษาของประชาชน", note: "ไม่ต้องใช้ภาษากฎหมาย" },
  { label: "ระบบจัดลำดับข้อเท็จจริงและถามข้อมูลที่ขาด", note: "ให้เรื่องครบและตรงตามที่เกิดขึ้น" },
  { label: "รู้ว่าสิทธิใดอาจเกี่ยวข้อง", note: "พร้อมแหล่งข้อมูลที่ตรวจสอบได้" },
  { label: "รู้ว่ามีทางเลือกอะไรบ้าง", note: "ไม่จำเป็นต้องเริ่มจากการร้องเสมอไป" },
  { label: "เปรียบเทียบผลดี ข้อจำกัด และผลที่อาจตามมา", note: "ตัดสินใจโดยเห็นผลของแต่ละทาง" },
  { label: "รู้ว่าหน่วยงานใดช่วยเรื่องใดได้", note: "รวมสิ่งที่หน่วยงานทำไม่ได้" },
  { label: "ประเมินความเสี่ยงและวิธีลดความเสี่ยง", note: "ความปลอดภัย ข้อมูล และการตอบโต้" },
  { label: "ผู้ใช้เลือกว่าจะร้อง ขอคำปรึกษา หรือเก็บข้อมูลเพิ่ม", note: "ผู้ใช้เป็นคนเลือกทางไปต่อ" },
  { label: "สร้างหนังสือร้องเรียนและชุดเอกสารพร้อมยื่น", note: "ตรวจทานก่อนดาวน์โหลด" },
  { label: "ส่งเรื่อง รับเลขอ้างอิง และติดตามผล", note: "เก็บหลักฐานการยื่นไว้กับผู้ใช้" },
] as const;

type EmergencyStatus = "checking" | "safe";

export function PrivacyFirstWorkflow() {
  const [story, setStory] = useState("");
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>("checking");
  const [selectedThreatIds, setSelectedThreatIds] = useState<string[]>([]);
  const [otherThreat, setOtherThreat] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isRequestingMicrophone, setIsRequestingMicrophone] = useState(false);
  const [showMicrophoneHelp, setShowMicrophoneHelp] = useState(false);
  const [copyLinkStatus, setCopyLinkStatus] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [emergencyCatalog, setEmergencyCatalog] = useState<EmergencyCatalog>({
    contacts: emergencyContacts,
    threatGroups: urgentThreatGroups,
    keywords: emergencyThreatKeywords,
    checkedAt: emergencySourceCheckedAt,
  });
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const activeStep = emergencyStatus === "safe" ? 1 : 0;
  const selectedThreatIdSet = new Set(selectedThreatIds);
  const selectedThreats = emergencyCatalog.threatGroups
    .flatMap((group) => group.threats)
    .filter((threat) => selectedThreatIdSet.has(threat.id));
  const hasOtherThreat = otherThreat.trim().length > 0;
  const inferredThreatMatches = hasOtherThreat
    ? classifyEmergencyText(otherThreat, { threatGroups: emergencyCatalog.threatGroups, keywords: emergencyCatalog.keywords })
    : [];
  const inferredThreats = inferredThreatMatches.map((match) => match.threat);
  const effectiveThreats = [...selectedThreats];

  inferredThreats.forEach((threat) => {
    if (!effectiveThreats.some((effectiveThreat) => effectiveThreat.id === threat.id)) effectiveThreats.push(threat);
  });

  const recommendedContactIdSet = new Set(effectiveThreats.flatMap((threat) => threat.contactIds));
  const hasUrgentThreat = selectedThreats.length > 0 || hasOtherThreat;

  if (hasOtherThreat && inferredThreatMatches.length === 0 && selectedThreats.length === 0) {
    fallbackEmergencyContactIds.forEach((contactId) => recommendedContactIdSet.add(contactId));
  }

  const recommendedContacts = emergencyCatalog.contacts.filter((contact) => recommendedContactIdSet.has(contact.id));

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (isStaticPublicDemo) return;

    const controller = new AbortController();

    async function loadPublishedEmergencyCatalog() {
      try {
        const response = await fetch("/api/knowledge/emergency", { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as { data?: EmergencyCatalog };
        const catalog = payload.data;

        if (catalog && Array.isArray(catalog.contacts) && Array.isArray(catalog.threatGroups) && catalog.contacts.length > 0 && catalog.threatGroups.length > 0) {
          setEmergencyCatalog(catalog);
        }
      } catch {
        // The reviewed bundled catalog remains available when Supabase is offline.
      }
    }

    void loadPublishedEmergencyCatalog();
    return () => controller.abort();
  }, []);

  async function requestMicrophoneAccess() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSpeechError("เบราว์เซอร์นี้ไม่สามารถเปิดหน้าต่างขอใช้ไมโครโฟนได้ กรุณาเปิดเว็บผ่าน HTTPS หรือพิมพ์ข้อความแทน");
      return false;
    }

    setIsRequestingMicrophone(true);
    setSpeechError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      const errorName = error instanceof DOMException ? error.name : "";

      if (errorName === "NotAllowedError" || errorName === "SecurityError") {
        setSpeechError("");
        setShowMicrophoneHelp(true);
      } else if (errorName === "NotFoundError") {
        setSpeechError("ไม่พบไมโครโฟนที่พร้อมใช้งาน กรุณาตรวจอุปกรณ์แล้วลองอีกครั้ง");
      } else {
        setSpeechError("เปิดไมโครโฟนไม่ได้ กรุณาตรวจการตั้งค่าของเบราว์เซอร์แล้วลองอีกครั้ง หรือพิมพ์ข้อความแทน");
      }

      return false;
    } finally {
      setIsRequestingMicrophone(false);
    }
  }

  async function toggleSpeechInput() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const microphoneAllowed = await requestMicrophoneAccess();
    if (!microphoneAllowed) return;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setSpeechError("อนุญาตไมโครโฟนแล้ว แต่เบราว์เซอร์นี้ยังแปลงเสียงภาษาไทยเป็นข้อความไม่ได้ กรุณาเปิดหน้านี้ใน Chrome หรือ Edge");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "th-TH";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError("");
    };
    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) transcript += result[0]?.transcript ?? "";
      }

      const spokenText = transcript.trim();
      if (spokenText) {
        setStory((currentStory) => `${currentStory}${currentStory.trim() ? " " : ""}${spokenText}`.slice(0, 5000));
      }
    };
    recognition.onerror = (event) => {
      const errorMessages: Record<string, string> = {
        "not-allowed": "ไมโครโฟนไม่ได้รับอนุญาต กรุณาอนุญาตการใช้ไมโครโฟนแล้วลองอีกครั้ง",
        "service-not-allowed": "เบราว์เซอร์ไม่อนุญาตให้ใช้บริการรู้จำเสียง กรุณาพิมพ์แทน",
        "audio-capture": "ไม่พบไมโครโฟนที่พร้อมใช้งาน กรุณาตรวจอุปกรณ์แล้วลองอีกครั้ง",
        "no-speech": "ยังไม่ได้ยินเสียง ลองพูดใกล้ไมโครโฟนแล้วเริ่มใหม่อีกครั้ง",
        network: "บริการรู้จำเสียงเชื่อมต่อไม่ได้ กรุณาลองใหม่หรือพิมพ์แทน",
      };

      setSpeechError(errorMessages[event.error] ?? "ไม่สามารถเปลี่ยนเสียงเป็นข้อความได้ กรุณาลองใหม่หรือพิมพ์แทน");
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function handleSpeechButton() {
    setSpeechError("");
    void toggleSpeechInput();
  }

  async function copyCurrentPageLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLinkStatus("คัดลอกลิงก์แล้ว นำไปวางใน Chrome หรือ Edge ได้เลย");
    } catch {
      setCopyLinkStatus("คัดลอกอัตโนมัติไม่ได้ กรุณาคัดลอกที่อยู่เว็บจากด้านบนของหน้าจอ");
    }
  }

  function toggleThreat(threatId: string) {
    setSelectedThreatIds((currentThreatIds) =>
      currentThreatIds.includes(threatId)
        ? currentThreatIds.filter((currentThreatId) => currentThreatId !== threatId)
        : [...currentThreatIds, threatId],
    );
  }

  function clearEmergencyAnswers() {
    setSelectedThreatIds([]);
    setOtherThreat("");
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between border-b border-line pb-5">
        <a href="#main-content" className="text-[1.05rem] font-bold tracking-tight text-ink no-underline">
          สิทธิไปต่อ<span className="text-coral">•</span>
        </a>
        <div className="flex items-center gap-4 text-sm text-ink-soft">
          <div className="flex items-center gap-2" aria-label="สถานะความเป็นส่วนตัว">
            <span className="h-2.5 w-2.5 rounded-full bg-river" aria-hidden="true" />
            ไม่บันทึกเรื่องของคุณ
          </div>
          {!isStaticPublicDemo && (
            <a href="/admin" className="hidden font-bold text-river underline underline-offset-4 sm:inline">
              สำหรับผู้ดูแล
            </a>
          )}
        </div>
      </header>

      <section id="main-content" className="grid gap-10 py-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20 lg:py-20">
        <div className="self-start lg:sticky lg:top-10">
          <p className="mb-5 text-sm font-bold tracking-[0.16em] text-river">ผู้ช่วยก่อนร้องเรียน</p>
          <h1 className="max-w-[12ch] text-[clamp(2.45rem,5.5vw,5.2rem)] font-bold leading-[1.38] tracking-[-0.04em] text-ink">
            ก่อนจะร้อง<br />ขอให้รู้ทางไป
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-ink-soft sm:text-xl">
            เริ่มจากความปลอดภัย แล้วค่อยทำความเข้าใจเรื่อง สิทธิ ทางเลือก ผลที่อาจตามมา
            หน่วยงาน และความเสี่ยง ก่อนที่คุณจะเลือกทางไปต่อด้วยตัวเอง
          </p>

          <div className="mt-10 grid grid-cols-[2rem_1fr] gap-x-4" aria-label="ขั้นตอนทั้งหมด 11 ขั้น">
            {steps.map((step, index) => (
              <div className="contents" key={step.label}>
                <div className="relative flex justify-center">
                  <span
                    aria-current={index === activeStep ? "step" : undefined}
                    className={`z-10 mt-1 grid h-7 w-7 place-items-center rounded-full border text-xs font-bold ${
                      index === activeStep
                        ? "border-river bg-river text-white"
                        : index < activeStep
                          ? "border-river bg-[#e9f4f2] text-river"
                          : "border-line bg-paper text-ink-soft"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {index < steps.length - 1 && <span className="absolute bottom-[-0.25rem] top-8 w-px bg-line" aria-hidden="true" />}
                </div>
                <div className="pb-5">
                  <h2 className={`text-sm font-bold leading-6 ${index === activeStep ? "text-river" : "text-ink"}`}>{step.label}</h2>
                  <p className="text-xs leading-5 text-ink-soft">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="self-start border-t-[6px] border-saffron bg-white p-6 shadow-[0_24px_80px_rgba(16,44,61,0.11)] sm:p-10 lg:p-12">
          {emergencyStatus !== "safe" ? (
            <>
              <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
                <div>
                  <p className="text-sm font-bold text-river">ขั้นที่ 1 จาก 11</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">ตรวจเหตุเร่งด่วนก่อน</h2>
                </div>
                <span className="shrink-0 bg-[#fff2d5] px-3 py-1.5 text-xs font-bold text-[#7b5310]">ความปลอดภัยมาก่อน</span>
              </div>

              <div className="mt-8">
                <p className="text-lg font-bold leading-8 text-ink">เลือกเหตุที่กำลังเกิดขึ้นหรืออาจสร้างความเสียหายทันที</p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  เลือกได้มากกว่าหนึ่งข้อ รายการนี้ใช้เพื่อแนะนำช่องทางช่วยเหลือ ไม่ใช่การวินิจฉัยทางกฎหมาย และคำตอบจะไม่ถูกบันทึก
                </p>

                <div className="mt-6 space-y-3">
                  {emergencyCatalog.threatGroups.map((group, groupIndex) => (
                    <details key={group.id} open={groupIndex === 0} className="group border border-line bg-[#fbfcfa] open:bg-white">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 marker:content-none">
                        <span>
                          <strong className="block text-base text-ink">{group.title}</strong>
                          <span className="mt-1 block text-xs leading-5 text-ink-soft">{group.description}</span>
                        </span>
                        <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-lg leading-none text-river group-open:rotate-45" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      <fieldset className="border-t border-line px-4 pb-4 pt-3">
                        <legend className="sr-only">{group.title}</legend>
                        <div className="grid gap-2">
                          {group.threats.map((threat) => {
                            const isSelected = selectedThreatIdSet.has(threat.id);

                            return (
                              <label
                                key={threat.id}
                                className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                                  isSelected ? "border-coral bg-[#fff0ed]" : "border-transparent bg-paper hover:border-line"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleThreat(threat.id)}
                                  className="mt-1 h-5 w-5 shrink-0 accent-[#b95447]"
                                />
                                <span>
                                  <strong className="block text-sm leading-6 text-ink">{threat.label}</strong>
                                  <span className="mt-1 block text-xs leading-5 text-ink-soft">{threat.detail}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    </details>
                  ))}
                </div>

                <label htmlFor="other-threat" className="mt-6 block text-sm font-bold text-ink">
                  ภัยอื่นที่ไม่อยู่ในรายการ
                </label>
                <p id="other-threat-help" className="mt-1 text-xs leading-5 text-ink-soft">
                  เขียนสั้น ๆ ว่ากำลังเกิดอะไรขึ้น ไม่ต้องใส่ชื่อ เลขบัตร เลขบัญชี รหัสผ่าน หรือข้อมูลที่ระบุตัวบุคคล
                </p>
                <textarea
                  id="other-threat"
                  aria-describedby="other-threat-help"
                  value={otherThreat}
                  onChange={(event) => setOtherThreat(event.target.value.slice(0, 500))}
                  placeholder="เช่น มีคนส่งข้อความขู่และรู้ที่อยู่บ้านของฉัน"
                  className="mt-3 min-h-28 w-full resize-y border border-line bg-[#fbfcfa] p-4 text-base leading-7 text-ink placeholder:text-[#8ba0a5] focus:border-river focus:outline-none"
                />
                <div className="mt-1 text-right text-xs text-ink-soft">{otherThreat.length} / 500 ตัวอักษร</div>

                {hasOtherThreat && inferredThreatMatches.length > 0 && (
                  <div className="mt-4 border-l-4 border-river bg-[#e9f4f2] p-4" aria-live="polite">
                    <p className="text-sm font-bold text-ink">จากข้อความที่กรอก ระบบพบรายการที่ใกล้เคียง</p>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-ink-soft">
                      {inferredThreatMatches.map((match) => (
                        <li key={match.threat.id}>
                          <span className="font-bold text-river">• {match.threat.label}</span>
                          <span className="block pl-4 text-xs">จับคู่จากคำว่า “{match.matchedKeywords.slice(0, 3).join("”, “")}”</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs leading-5 text-ink-soft">
                      ระบบใช้กฎคำสำคัญที่ผู้ดูแลตรวจสอบ ไม่ได้ส่งข้อความไปให้ AI หากรายการไม่ตรง ให้เลือกจากหมวดด้านบนเพื่อแก้คำแนะนำ
                    </p>
                  </div>
                )}
              </div>

              {hasUrgentThreat && (
                <section className="mt-8 border-t-4 border-coral bg-[#fff8f6] p-5 sm:p-6" aria-live="polite">
                  <p className="text-xs font-bold tracking-[0.12em] text-coral">ช่องทางช่วยเหลือที่แนะนำ</p>
                  <h3 className="mt-2 text-2xl font-bold leading-9 text-ink">ติดต่อหน่วยงานเหล่านี้ก่อนใช้ระบบต่อ</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    หากมีอันตรายต่อชีวิตหรือกำลังเผชิญผู้ก่อเหตุ ให้ออกจากจุดเสี่ยงและโทร 191 หรือ 1669 ก่อน อย่ารอกรอกข้อมูลให้ครบ
                  </p>

                  <div className="mt-5 grid gap-3">
                    {recommendedContacts.map((contact, index) => (
                      <article key={contact.id} className="border border-[#e9c9c3] bg-white p-4">
                        <div className="flex items-start gap-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-coral text-xs font-bold text-white">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold leading-6 text-ink">{contact.name}</h4>
                            <p className="mt-1 text-xs leading-5 text-ink-soft">{contact.helpsWith}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {contact.channels.map((channel) =>
                            channel.href ? (
                              <a
                                key={channel.label}
                                href={channel.href}
                                target={channel.href.startsWith("http") ? "_blank" : undefined}
                                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                                className={`inline-flex min-h-10 items-center border px-3 py-2 text-sm font-bold no-underline ${
                                  channel.urgent ? "border-coral bg-coral text-white" : "border-river bg-white text-river"
                                }`}
                              >
                                {channel.label}
                              </a>
                            ) : (
                              <span key={channel.label} className="inline-flex min-h-10 items-center border border-coral bg-[#fff0ed] px-3 py-2 text-sm font-bold text-coral">
                                {channel.label}
                              </span>
                            ),
                          )}
                        </div>
                        {contact.channels.some((channel) => channel.detail) && (
                          <p className="mt-2 text-xs leading-5 text-ink-soft">
                            {contact.channels.map((channel) => channel.detail).filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <a href={contact.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold text-river underline underline-offset-4">
                          ตรวจสอบข้อมูลจาก {contact.sourceLabel}
                        </a>
                      </article>
                    ))}
                  </div>

                  {hasOtherThreat && inferredThreatMatches.length === 0 && selectedThreats.length === 0 && (
                    <p className="mt-4 border-l-4 border-saffron bg-white p-4 text-xs leading-5 text-ink-soft">
                      ข้อความนี้ยังไม่ตรงกับกฎที่ตรวจสอบแล้ว ระบบจึงแสดงเฉพาะ 191 สำหรับเหตุอันตรายทันที และ 1300 สำหรับให้เจ้าหน้าที่ช่วยคัดกรอง กรุณาเพิ่มคำอธิบายสั้น ๆ หรือเลือกหมวดที่ใกล้เคียงเพื่อให้คำแนะนำเฉพาะเจาะจงขึ้น
                    </p>
                  )}
                </section>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {hasUrgentThreat ? (
                  <button type="button" onClick={clearEmergencyAnswers} className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4">
                    ล้างรายการที่เลือก
                  </button>
                ) : (
                  <p className="max-w-sm text-xs leading-5 text-ink-soft">ตรวจสอบช่องทางล่าสุดเมื่อ {emergencyCatalog.checkedAt}</p>
                )}
                <button
                  type="button"
                  onClick={() => setEmergencyStatus("safe")}
                  className="min-h-12 bg-ink px-6 py-3 font-bold text-white transition hover:bg-river"
                >
                  {hasUrgentThreat ? "เมื่อปลอดภัยแล้ว ไปเล่าปัญหาต่อ →" : "ไม่มีภัยเร่งด่วน ไปเล่าปัญหาต่อ →"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-6 border-b border-line pb-7">
                <div>
                  <p className="text-sm font-bold text-river">ขั้นที่ 2 จาก 11</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">เล่าปัญหาด้วยภาษาของคุณ</h2>
                </div>
                <span className="shrink-0 bg-[#e9f4f2] px-3 py-1.5 text-xs font-bold text-river">อยู่ในเครื่องนี้เท่านั้น</span>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label htmlFor="story" className="block text-base font-bold text-ink">
                  เล่าตามที่จำได้ ไม่ต้องใช้ภาษากฎหมาย
                </label>
                <button
                  type="button"
                  onClick={handleSpeechButton}
                  disabled={isRequestingMicrophone}
                  aria-pressed={isListening}
                  aria-busy={isRequestingMicrophone}
                  aria-describedby="speech-help"
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:border-line disabled:text-[#86979b] ${
                    isListening
                      ? "border-coral bg-[#fff0ed] text-coral hover:bg-[#ffe5df]"
                      : "border-river bg-white text-river hover:bg-[#e9f4f2]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                    <rect x="8" y="3" width="8" height="12" rx="4" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
                  </svg>
                  {isListening
                    ? "หยุดฟัง"
                    : isRequestingMicrophone
                      ? "กำลังขออนุญาต…"
                      : "เล่าด้วยเสียง"}
                </button>
              </div>
              <p id="story-help" className="mt-2 text-sm leading-6 text-ink-soft">
                ลองบอกว่าเกิดอะไรขึ้น เมื่อไร ที่ไหน ใครเกี่ยวข้อง และคุณอยากให้ปัญหาจบอย่างไร
              </p>
              <p id="speech-help" className="mt-1 text-xs leading-5 text-ink-soft">
                {isListening
                  ? "กำลังฟังและเติมคำพูดลงในช่องด้านล่าง กด “หยุดฟัง” เมื่อเล่าจบ"
                  : "กดเล่าด้วยเสียงเมื่อพร้อม ระบบจะขอใช้ไมโครโฟนในตอนนั้น"}
              </p>
              {speechError && (
                <p className="mt-3 border-l-4 border-coral bg-[#fff0ed] px-4 py-3 text-sm leading-6 text-ink" role="alert">
                  <strong className="block">เปิดไมโครโฟนไม่สำเร็จ</strong>
                  {speechError}
                </p>
              )}
              {showMicrophoneHelp && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-[#102c3de0] p-5" role="presentation">
                  <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="microphone-help-title"
                    aria-describedby="microphone-help-description"
                    className="w-full max-w-lg border-t-8 border-saffron bg-white p-6 shadow-[12px_12px_0_#217985] sm:p-8"
                  >
                    <p className="text-xs font-bold tracking-[0.14em] text-coral">หน้าต่างนี้ใช้ไมโครโฟนไม่ได้</p>
                    <h3 id="microphone-help-title" className="mt-2 text-3xl font-bold leading-10 text-ink">
                      เปิดหน้านี้ใน Chrome หรือ Edge
                    </h3>
                    <div id="microphone-help-description" className="mt-3 text-sm leading-6 text-ink-soft">
                      เว็บขอใช้ไมโครโฟนทันทีแล้ว แต่หน้าต่างเว็บในแอปไม่แสดงปุ่ม “อนุญาต” ให้นำลิงก์นี้ไปเปิดใน Chrome หรือ Edge แล้วกด “เล่าด้วยเสียง” อีกครั้ง ปุ่มอนุญาตจะปรากฏจากเบราว์เซอร์โดยตรง
                    </div>
                    {copyLinkStatus && <p className="mt-4 border-l-4 border-river bg-[#e9f4f2] p-3 text-xs leading-5 text-ink" role="status">{copyLinkStatus}</p>}
                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setShowMicrophoneHelp(false)}
                        className="min-h-12 border border-line px-5 py-3 font-bold text-ink"
                      >
                        ใช้การพิมพ์แทน
                      </button>
                      <button
                        type="button"
                        autoFocus
                        onClick={copyCurrentPageLink}
                        className="min-h-12 bg-river px-5 py-3 font-bold text-white hover:bg-ink"
                      >
                        คัดลอกลิงก์
                      </button>
                    </div>
                  </section>
                </div>
              )}
              <textarea
                id="story"
                aria-describedby="story-help privacy-note"
                value={story}
                onChange={(event) => setStory(event.target.value.slice(0, 5000))}
                placeholder="เช่น เมื่อสัปดาห์ก่อนมีเจ้าหน้าที่..."
                className="mt-5 min-h-64 w-full resize-y border border-line bg-[#fbfcfa] p-5 text-lg leading-8 text-ink placeholder:text-[#8ba0a5] focus:border-river focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
                <span>{story.length} / 5,000 ตัวอักษร</span>
                {story.length > 0 && (
                  <button type="button" onClick={() => setStory("")} className="font-bold text-coral underline underline-offset-4">
                    ลบข้อความทั้งหมด
                  </button>
                )}
              </div>

              <aside id="privacy-note" className="mt-8 border-l-4 border-river bg-[#e9f4f2] p-5 text-sm leading-6 text-ink">
                <strong className="block">แอปไม่บันทึกเรื่องหรือไฟล์เสียงของคุณ</strong>
                ข้อความอยู่ในหน่วยความจำชั่วคราวและจะหายเมื่อปิดหรือโหลดหน้าใหม่ ไม่ใช้ localStorage และไม่มีระบบบัญชีผู้ใช้
                หากใช้ไมโครโฟน เบราว์เซอร์อาจใช้บริการรู้จำเสียงของผู้ให้บริการเพื่อแปลงเสียงเป็นข้อความตามการตั้งค่าของอุปกรณ์
              </aside>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setEmergencyStatus("checking")}
                  className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4"
                >
                  ← กลับไปตรวจเหตุเร่งด่วน
                </button>
                <button
                  type="button"
                  disabled={story.trim().length < 20}
                  className="min-h-12 bg-ink px-7 py-3 font-bold text-white transition hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]"
                  title="ขั้นถัดไปคือการจัดลำดับข้อเท็จจริงและถามข้อมูลที่ขาด"
                >
                  จัดลำดับข้อเท็จจริง →
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="grid gap-4 border-t border-line py-6 text-sm text-ink-soft sm:grid-cols-2">
        <p>รุ่นตั้งต้นสำหรับพัฒนาและทดสอบกับผู้ใช้ — ยังไม่ใช่คำปรึกษากฎหมาย</p>
        <p className="sm:text-right">ความรู้มาจากแหล่งทางการและต้องผ่านการตรวจทานก่อนเผยแพร่</p>
      </footer>
    </div>
  );
}
