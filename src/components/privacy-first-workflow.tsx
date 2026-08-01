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
import { EmergencyShortcut } from "@/components/emergency-shortcut";
import { AgencyGuidance } from "@/components/agency-guidance";
import { ActionOptionsGuidance } from "@/components/action-options-guidance";
import { AssistanceModeSelector } from "@/components/assistance-mode-selector";
import { ComplaintPackageBuilder, type DocumentDraft } from "@/components/complaint-package-builder";
import { DecisionGuidance } from "@/components/decision-guidance";
import { OptionComparison } from "@/components/option-comparison";
import { RiskGuidance } from "@/components/risk-guidance";
import { RightsGuidance } from "@/components/rights-guidance";
import { StoryInterview } from "@/components/story-interview";
import { SubmissionGuidance, type TrackingDraft } from "@/components/submission-guidance";
import { WorkflowAiAssistant } from "@/components/workflow-ai-assistant";
import {
  createRuleBasedStoryAssistance,
  type AssistanceMode,
  type StoryAssistanceResult,
  type StoryFollowUpAnswer,
} from "@/lib/story-assistance";
import { suggestRights } from "@/lib/rights-guidance";
import { suggestActionOptions, type ActionOptionId } from "@/lib/action-options";
import {
  assessRisks,
  buildEvidenceChecklist,
  getAgencyById,
  matchComplaintTypes,
  suggestAgencies,
  type FinalDecision,
} from "@/lib/workflow-guidance";

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
  processLocally?: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type OnDeviceSpeechAvailability = "available" | "downloadable" | "downloading" | "unavailable";

type BrowserSpeechRecognitionConstructor = {
  new (): BrowserSpeechRecognition;
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<OnDeviceSpeechAvailability>;
  install?: (options: { langs: string[]; processLocally: boolean }) => Promise<boolean>;
};

type SpeechProcessingMode = "unknown" | "device" | "network";

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
type WorkflowStage = "story" | "rights" | "options" | "comparison" | "agencies" | "risks" | "decision" | "document" | "submission";

const emptyDocumentDraft: DocumentDraft = {
  date: "",
  name: "",
  contact: "",
  address: "",
  subject: "",
  facts: "",
  requests: "",
  selectedEvidence: [],
};

const emptyTrackingDraft: TrackingDraft = {
  status: "not-sent",
  channel: "",
  sentDate: "",
  referenceNumber: "",
  followUpDate: "",
  note: "",
};

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
  const [speechStatus, setSpeechStatus] = useState("");
  const [speechProcessingMode, setSpeechProcessingMode] = useState<SpeechProcessingMode>("unknown");
  const [assistanceMode, setAssistanceMode] = useState<AssistanceMode>("rules");
  const [aiConsent, setAiConsent] = useState(false);
  const [assistanceResult, setAssistanceResult] = useState<StoryAssistanceResult | null>(null);
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>("story");
  const [selectedActionOptionIds, setSelectedActionOptionIds] = useState<ActionOptionId[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [acknowledgedRiskIds, setAcknowledgedRiskIds] = useState<string[]>([]);
  const [finalDecision, setFinalDecision] = useState<FinalDecision | null>(null);
  const [documentDraft, setDocumentDraft] = useState<DocumentDraft>(emptyDocumentDraft);
  const [trackingDraft, setTrackingDraft] = useState<TrackingDraft>(emptyTrackingDraft);
  const [confirmedFollowUpAnswers, setConfirmedFollowUpAnswers] = useState<StoryFollowUpAnswer[]>([]);
  const [interviewRound, setInterviewRound] = useState(0);
  const [assistanceError, setAssistanceError] = useState("");
  const [isAnalyzingStory, setIsAnalyzingStory] = useState(false);
  const [emergencyCatalog, setEmergencyCatalog] = useState<EmergencyCatalog>({
    contacts: emergencyContacts,
    threatGroups: urgentThreatGroups,
    keywords: emergencyThreatKeywords,
    checkedAt: emergencySourceCheckedAt,
  });
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const aiConsentRef = useRef<HTMLInputElement | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const restartSpeechTimerRef = useRef<number | null>(null);
  const activeStep = emergencyStatus !== "safe"
    ? 0
    : workflowStage === "submission"
      ? 10
      : workflowStage === "document"
        ? 9
        : workflowStage === "decision"
          ? 8
          : workflowStage === "risks"
            ? 7
            : workflowStage === "agencies"
              ? 6
              : workflowStage === "comparison"
                ? 5
                : workflowStage === "options"
                  ? 4
                  : workflowStage === "rights"
                    ? 3
                    : assistanceResult
                      ? 2
                      : 1;
  const rightsInput = [
    story,
    assistanceResult?.summary ?? "",
    ...confirmedFollowUpAnswers
      .filter((answer) => answer.status === "answered")
      .map((answer) => answer.answer),
  ].join("\n");
  const suggestedRights = suggestRights(rightsInput);
  const suggestedActionOptions = suggestActionOptions(rightsInput);
  const selectedActionOptions = suggestedActionOptions.filter((option) => selectedActionOptionIds.includes(option.id));
  const complaintTypeMatches = matchComplaintTypes(rightsInput);
  const suggestedAgencies = suggestAgencies(rightsInput, selectedActionOptionIds);
  const selectedAgency = getAgencyById(suggestedAgencies, selectedAgencyId);
  const riskAssessments = assessRisks(rightsInput, selectedAgency);
  const evidenceChecklist = buildEvidenceChecklist(rightsInput, complaintTypeMatches);
  const shouldPromptAiConsent = assistanceMode === "ai"
    && !aiConsent
    && assistanceError.startsWith("กรุณาติ๊กยืนยันการใช้ AI");
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
      shouldKeepListeningRef.current = false;
      if (restartSpeechTimerRef.current !== null) window.clearTimeout(restartSpeechTimerRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  function resetStoryAssistance() {
    setWorkflowStage("story");
    setAssistanceResult(null);
    setSelectedActionOptionIds([]);
    setSelectedAgencyId(null);
    setAcknowledgedRiskIds([]);
    setFinalDecision(null);
    setDocumentDraft(emptyDocumentDraft);
    setTrackingDraft(emptyTrackingDraft);
    setConfirmedFollowUpAnswers([]);
    setInterviewRound(0);
    setAssistanceError("");
  }

  function continueFromFacts() {
    if (!assistanceResult) {
      void handleStoryAssistance();
      return;
    }

    if (assistanceResult.readiness.readyForReview) setWorkflowStage("rights");
  }

  function toggleActionOption(optionId: ActionOptionId) {
    setSelectedActionOptionIds((currentIds) => (
      currentIds.includes(optionId)
        ? currentIds.filter((currentId) => currentId !== optionId)
        : [...currentIds, optionId]
    ));
  }

  function changeAssistanceMode(nextMode: AssistanceMode) {
    setAssistanceMode(nextMode);
    setAssistanceError("");
    if (nextMode === "rules") setAiConsent(false);

    if (workflowStage === "story") {
      setAssistanceResult(null);
      setConfirmedFollowUpAnswers([]);
      setInterviewRound(0);
    }
  }

  function requireAiConsent() {
    setAssistanceError("กรุณาติ๊กยืนยันการใช้ AI ในกรอบสีเหลืองก่อน แล้วกดปุ่ม AI อีกครั้ง");
    aiConsentRef.current?.focus();
    aiConsentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function toggleRiskAcknowledgement(riskId: string) {
    setAcknowledgedRiskIds((currentIds) => currentIds.includes(riskId)
      ? currentIds.filter((currentId) => currentId !== riskId)
      : [...currentIds, riskId]);
  }

  function continueFromDecision() {
    if (!finalDecision || !selectedAgency || !assistanceResult) return;

    const topicLabel = complaintTypeMatches[0]?.label ?? "ปัญหาที่ขอให้ตรวจสอบ";
    const requestText = finalDecision === "complaint"
      ? "ขอให้ตรวจสอบข้อเท็จจริง แจ้งผลและความคืบหน้า และดำเนินการแก้ไขหรือป้องกันความเสียหายตามหน้าที่และอำนาจ"
      : finalDecision === "consult"
        ? "ขอคำปรึกษาว่าเรื่องนี้อยู่ในหน้าที่ของหน่วยงานใด มีข้อมูลใดต้องเตรียม และควรระวังกำหนดเวลาหรือการเปิดเผยข้อมูลเรื่องใด"
        : "จัดลำดับเหตุการณ์ เก็บหลักฐานที่ปลอดภัย และประเมินความพร้อมก่อนตัดสินใจดำเนินการ";

    setDocumentDraft((currentDraft) => ({
      ...currentDraft,
      subject: currentDraft.subject || `${finalDecision === "complaint" ? "ขอให้ตรวจสอบกรณี" : finalDecision === "consult" ? "ขอคำปรึกษากรณี" : "แผนเตรียมข้อมูลกรณี"}${topicLabel}`,
      facts: currentDraft.facts || assistanceResult.summary,
      requests: currentDraft.requests || requestText,
    }));
    setWorkflowStage("document");
  }

  function restartWorkflow() {
    stopSpeechInput();
    setStory("");
    setEmergencyStatus("checking");
    setSelectedThreatIds([]);
    setOtherThreat("");
    setAssistanceMode("rules");
    setAiConsent(false);
    resetStoryAssistance();
  }

  function updateStory(nextStory: string) {
    setStory(nextStory.slice(0, 5000));
    resetStoryAssistance();
  }

  useEffect(() => {
    if (isStaticPublicDemo || !navigator.onLine) return;

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

  async function canProcessSpeechOnDevice(Recognition: BrowserSpeechRecognitionConstructor) {
    if (!Recognition.available) return false;

    try {
      const options = { langs: ["th-TH"], processLocally: true };
      const availability = await Recognition.available(options);
      if (availability === "available") return true;

      if ((availability === "downloadable" || availability === "downloading") && Recognition.install) {
        setSpeechStatus("กำลังเตรียมชุดภาษาไทยสำหรับแปลงเสียงในเครื่อง…");
        return await Recognition.install(options);
      }
    } catch {
      // This experimental browser feature is optional; fall back to the normal speech service.
    }

    return false;
  }

  function startRecognitionSession(Recognition: BrowserSpeechRecognitionConstructor, processLocally: boolean) {
    if (!shouldKeepListeningRef.current) return;

    const recognition = new Recognition();
    recognition.lang = "th-TH";
    recognition.continuous = true;
    recognition.interimResults = false;
    if (processLocally) recognition.processLocally = true;
    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError("");
      setSpeechStatus(processLocally ? "กำลังฟังต่อเนื่องและแปลงเสียงในเครื่อง" : "กำลังฟังต่อเนื่องผ่านบริการรู้จำเสียงของเบราว์เซอร์");
    };
    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) transcript += result[0]?.transcript ?? "";
      }

      const spokenText = transcript.trim();
      if (spokenText) {
        resetStoryAssistance();
        setStory((currentStory) => `${currentStory}${currentStory.trim() ? " " : ""}${spokenText}`.slice(0, 5000));
      }
    };
    recognition.onerror = (event) => {
      const errorMessages: Record<string, string> = {
        "not-allowed": "ไมโครโฟนไม่ได้รับอนุญาต กรุณาอนุญาตการใช้ไมโครโฟนแล้วลองอีกครั้ง",
        "service-not-allowed": "เบราว์เซอร์ไม่อนุญาตให้ใช้บริการรู้จำเสียง กรุณาพิมพ์แทน",
        "audio-capture": "ไม่พบไมโครโฟนที่พร้อมใช้งาน กรุณาตรวจอุปกรณ์แล้วลองอีกครั้ง",
        network: "บริการรู้จำเสียงเชื่อมต่อไม่ได้ กรุณาลองใหม่หรือพิมพ์แทน",
        "language-not-supported": "อุปกรณ์นี้ยังไม่รองรับการแปลงเสียงภาษาไทย กรุณาพิมพ์แทน",
      };

      if (event.error === "no-speech" || event.error === "aborted") {
        if (shouldKeepListeningRef.current) setSpeechStatus("ยังไม่ได้ยินเสียง ระบบกำลังเปิดฟังต่อให้อัตโนมัติ…");
        return;
      }

      shouldKeepListeningRef.current = false;
      setSpeechError(errorMessages[event.error] ?? "ไม่สามารถเปลี่ยนเสียงเป็นข้อความได้ กรุณาลองใหม่หรือพิมพ์แทน");
      setSpeechStatus("");
      setIsListening(false);
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;

      if (shouldKeepListeningRef.current) {
        setSpeechStatus("เบราว์เซอร์ตัดช่วงเสียง ระบบกำลังเปิดฟังต่อให้อัตโนมัติ…");
        restartSpeechTimerRef.current = window.setTimeout(() => {
          startRecognitionSession(Recognition, processLocally);
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      shouldKeepListeningRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);
      setSpeechStatus("");
      setSpeechError("เปิดการฟังต่อเนื่องไม่สำเร็จ กรุณาลองใหม่หรือพิมพ์แทน");
    }
  }

  function stopSpeechInput() {
    shouldKeepListeningRef.current = false;
    if (restartSpeechTimerRef.current !== null) {
      window.clearTimeout(restartSpeechTimerRef.current);
      restartSpeechTimerRef.current = null;
    }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setSpeechStatus("หยุดรับเสียงแล้ว");
  }

  async function toggleSpeechInput() {
    if (shouldKeepListeningRef.current || isListening) {
      stopSpeechInput();
      return;
    }

    const microphoneAllowed = await requestMicrophoneAccess();
    if (!microphoneAllowed) return;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setSpeechError("อนุญาตไมโครโฟนแล้ว แต่เบราว์เซอร์นี้ยังแปลงเสียงภาษาไทยเป็นข้อความไม่ได้ กรุณาเปิดหน้านี้ใน Chrome หรือ Edge");
      return;
    }

    setIsRequestingMicrophone(true);
    const processLocally = await canProcessSpeechOnDevice(Recognition);
    setIsRequestingMicrophone(false);
    setSpeechProcessingMode(processLocally ? "device" : "network");

    if (!processLocally && !navigator.onLine) {
      setSpeechError("ขณะนี้ไม่มีอินเทอร์เน็ต และอุปกรณ์นี้ยังไม่มีชุดภาษาไทยสำหรับแปลงเสียงในเครื่อง กรุณาพิมพ์ข้อความแทน");
      setSpeechStatus("");
      return;
    }

    shouldKeepListeningRef.current = true;
    startRecognitionSession(Recognition, processLocally);
  }

  function handleSpeechButton() {
    setSpeechError("");
    void toggleSpeechInput();
  }

  async function fetchAiStoryAssistance(normalizedStory: string, followUpAnswers: StoryFollowUpAnswer[]) {
    if (isStaticPublicDemo) throw new Error("static-demo");
    if (!navigator.onLine) throw new Error("offline");

    const response = await fetch("/api/ai/story-assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: normalizedStory, consent: true, followUpAnswers }),
      cache: "no-store",
    });
    const payload = (await response.json()) as { data?: StoryAssistanceResult; error?: string };
    if (!response.ok || !payload.data) throw new Error(payload.error ?? "ai-unavailable");
    return payload.data;
  }

  async function handleStoryAssistance() {
    const normalizedStory = story.trim();
    if (normalizedStory.length < 20) return;

    setAssistanceError("");
    setAssistanceResult(null);
    setConfirmedFollowUpAnswers([]);
    setInterviewRound(0);

    if (assistanceMode === "rules") {
      setAssistanceResult(createRuleBasedStoryAssistance(normalizedStory));
      return;
    }

    if (!aiConsent) {
      setAssistanceError("กรุณาติ๊กยืนยันการใช้ AI ในกรอบสีเหลืองก่อน แล้วกดจัดลำดับข้อเท็จจริงอีกครั้ง");
      aiConsentRef.current?.focus();
      aiConsentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsAnalyzingStory(true);
    const fallback = createRuleBasedStoryAssistance(normalizedStory);

    try {
      const result = await fetchAiStoryAssistance(normalizedStory, []);
      setAssistanceResult(result);
      setInterviewRound(1);
    } catch (error) {
      setAssistanceResult(fallback);
      const reason = error instanceof Error ? error.message : "";
      setAssistanceError(
        reason === "offline"
          ? "ไม่มีอินเทอร์เน็ต จึงเปลี่ยนมาใช้รายการตรวจสอบในเครื่องให้โดยอัตโนมัติ"
          : isStaticPublicDemo
            ? "เว็บสาธิตนี้ทำงานแบบไม่ใช้ AI จึงใช้รายการตรวจสอบในเครื่องให้โดยอัตโนมัติ"
            : "AI ยังไม่พร้อมใช้งาน จึงใช้รายการตรวจสอบในเครื่องให้โดยอัตโนมัติ",
      );
    } finally {
      setIsAnalyzingStory(false);
    }
  }

  async function handleFollowUpReview(roundAnswers: StoryFollowUpAnswer[]) {
    const normalizedStory = story.trim();
    const mergedAnswersByQuestion = new Map(
      [...confirmedFollowUpAnswers, ...roundAnswers].map((answer) => [answer.questionId, answer]),
    );
    const mergedAnswers = Array.from(mergedAnswersByQuestion.values());

    setAssistanceError("");
    setIsAnalyzingStory(true);

    try {
      const result = await fetchAiStoryAssistance(normalizedStory, mergedAnswers);
      setConfirmedFollowUpAnswers(mergedAnswers.filter((answer) => answer.status !== "skipped"));
      setAssistanceResult(result);
      setInterviewRound((currentRound) => currentRound + 1);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "";
      setAssistanceError(
        reason === "offline"
          ? "ไม่มีอินเทอร์เน็ต คำตอบยังอยู่ในหน่วยความจำของหน้านี้ กรุณาเชื่อมต่อแล้วกดตรวจอีกครั้ง"
          : "AI ยังตรวจคำตอบรอบนี้ไม่ได้ คำตอบยังอยู่ในหน่วยความจำของหน้านี้และยังไม่ถูกบันทึก",
      );
    } finally {
      setIsAnalyzingStory(false);
    }
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
          <AssistanceModeSelector
            mode={assistanceMode}
            consent={aiConsent}
            consentRef={aiConsentRef}
            showConsentError={shouldPromptAiConsent}
            onModeChange={changeAssistanceMode}
            onConsentChange={(consent) => {
              setAiConsent(consent);
              if (consent) setAssistanceError("");
            }}
          />

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

                <WorkflowAiAssistant
                  key={`emergency-${otherThreat}-${selectedThreatIds.join("-")}`}
                  stage="emergency"
                  mode={assistanceMode}
                  consent={aiConsent}
                  context={otherThreat || effectiveThreats.map((threat) => threat.label).join(" · ")}
                  grounding={[
                    ...effectiveThreats.map((threat) => `ภัยที่กฎพบ: ${threat.label} — ${threat.detail}`),
                    ...recommendedContacts.map((contact) => `ช่องทางที่กฎแนะนำ: ${contact.name} — ${contact.channels.map((channel) => channel.label).join(", ")}`),
                    ...(effectiveThreats.length === 0 ? ["กฎยังไม่พบภัยที่ตรงกับข้อความ จึงต้องถามผู้ใช้เพิ่มหรือให้เจ้าหน้าที่ช่วยคัดกรอง"] : []),
                  ]}
                  buttonLabel="ให้ AI ช่วยอ่านภัยที่ระบุ"
                  onRequireConsent={requireAiConsent}
                />
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
                                aria-label={channel.href.startsWith("tel:") ? `${channel.label} เปิดหน้าจอโทรศัพท์พร้อมหมายเลข` : undefined}
                                className={`inline-flex min-h-10 items-center border px-3 py-2 text-sm font-bold no-underline ${
                                  channel.urgent ? "border-coral bg-coral text-white" : "border-river bg-white text-river"
                                }`}
                              >
                                {channel.href.startsWith("tel:") ? "☎ " : ""}{channel.label}
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
          ) : workflowStage === "submission" && assistanceResult && selectedAgency && finalDecision ? (
            <SubmissionGuidance
              decision={finalDecision}
              agency={selectedAgency}
              tracking={trackingDraft}
              mode={assistanceMode}
              consent={aiConsent}
              context={assistanceResult.summary}
              onTrackingChange={setTrackingDraft}
              onBack={() => setWorkflowStage("document")}
              onRestart={restartWorkflow}
              onRequireConsent={requireAiConsent}
            />
          ) : workflowStage === "document" && assistanceResult && selectedAgency && finalDecision ? (
            <ComplaintPackageBuilder
              decision={finalDecision}
              agency={selectedAgency}
              evidenceChecklist={evidenceChecklist}
              draft={documentDraft}
              mode={assistanceMode}
              consent={aiConsent}
              aiContext={assistanceResult.summary}
              onDraftChange={setDocumentDraft}
              onBack={() => setWorkflowStage("decision")}
              onContinue={() => setWorkflowStage("submission")}
              onRequireConsent={requireAiConsent}
            />
          ) : workflowStage === "decision" && assistanceResult && selectedAgency ? (
            <DecisionGuidance
              decision={finalDecision}
              agency={selectedAgency}
              mode={assistanceMode}
              consent={aiConsent}
              context={rightsInput}
              onSelect={setFinalDecision}
              onBack={() => setWorkflowStage("risks")}
              onContinue={continueFromDecision}
              onRequireConsent={requireAiConsent}
            />
          ) : workflowStage === "risks" && assistanceResult && selectedAgency ? (
            <RiskGuidance
              risks={riskAssessments}
              acknowledgedRiskIds={acknowledgedRiskIds}
              mode={assistanceMode}
              consent={aiConsent}
              context={rightsInput}
              onToggleAcknowledgement={toggleRiskAcknowledgement}
              onBack={() => setWorkflowStage("agencies")}
              onContinue={() => setWorkflowStage("decision")}
              onRequireConsent={requireAiConsent}
            />
          ) : workflowStage === "agencies" && assistanceResult ? (
            <AgencyGuidance
              agencies={suggestedAgencies}
              selectedAgencyId={selectedAgencyId}
              mode={assistanceMode}
              consent={aiConsent}
              context={rightsInput}
              onSelect={(agencyId) => {
                setSelectedAgencyId(agencyId);
                setAcknowledgedRiskIds([]);
              }}
              onBack={() => setWorkflowStage("comparison")}
              onContinue={() => setWorkflowStage("risks")}
              onRequireConsent={requireAiConsent}
            />
          ) : workflowStage === "comparison" && assistanceResult ? (
            <OptionComparison
              options={selectedActionOptions}
              mode={assistanceMode}
              consent={aiConsent}
              context={rightsInput}
              onBack={() => setWorkflowStage("options")}
              onContinue={() => setWorkflowStage("agencies")}
              onRequireConsent={requireAiConsent}
            />
          ) : workflowStage === "options" && assistanceResult ? (
            <ActionOptionsGuidance
              options={suggestedActionOptions}
              selectedIds={selectedActionOptionIds}
              mode={assistanceMode}
              consent={aiConsent}
              context={rightsInput}
              onToggle={toggleActionOption}
              onBack={() => setWorkflowStage("rights")}
              onCompare={() => setWorkflowStage("comparison")}
              onRequireConsent={requireAiConsent}
            />
          ) : workflowStage === "rights" && assistanceResult ? (
            <RightsGuidance
              rights={suggestedRights}
              mode={assistanceMode}
              consent={aiConsent}
              context={rightsInput}
              onBack={() => setWorkflowStage("story")}
              onContinue={() => setWorkflowStage("options")}
              onRequireConsent={requireAiConsent}
            />
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
                    ? "หยุดเล่าด้วยเสียง"
                    : isRequestingMicrophone
                      ? "กำลังเตรียมไมโครโฟน…"
                      : "เล่าด้วยเสียง"}
                </button>
              </div>
              <p id="story-help" className="mt-2 text-sm leading-6 text-ink-soft">
                ลองบอกว่าเกิดอะไรขึ้น เมื่อไร ที่ไหน ใครเกี่ยวข้อง และคุณอยากให้ปัญหาจบอย่างไร
              </p>
              <p id="speech-help" className="mt-1 text-xs leading-5 text-ink-soft">
                {isListening
                  ? "กำลังฟังต่อเนื่องและเติมคำพูดลงในช่องด้านล่าง หากเบราว์เซอร์ตัดช่วงเสียง ระบบจะเปิดฟังต่อให้เอง กด “หยุดเล่าด้วยเสียง” เมื่อเล่าจบ"
                  : "กดเล่าด้วยเสียงเมื่อพร้อม ระบบจะขอใช้ไมโครโฟนในตอนนั้น"}
              </p>
              {speechStatus && (
                <p className="mt-2 text-xs font-semibold leading-5 text-river" role="status" aria-live="polite">
                  {speechStatus}
                  {speechProcessingMode === "device" ? " — ใช้ได้โดยไม่ส่งเสียงไปบริการออนไลน์" : speechProcessingMode === "network" ? " — ต้องใช้อินเทอร์เน็ต" : ""}
                </p>
              )}
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
                onChange={(event) => updateStory(event.target.value)}
                placeholder="เช่น เมื่อสัปดาห์ก่อนมีเจ้าหน้าที่..."
                className="mt-5 min-h-64 w-full resize-y border border-line bg-[#fbfcfa] p-5 text-lg leading-8 text-ink placeholder:text-[#8ba0a5] focus:border-river focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
                <span>{story.length} / 5,000 ตัวอักษร</span>
                {story.length > 0 && (
                  <button type="button" onClick={() => updateStory("")} className="font-bold text-coral underline underline-offset-4">
                    ลบข้อความทั้งหมด
                  </button>
                )}
              </div>

              {(assistanceError || assistanceResult) && (
                <section className="mt-6 border border-line bg-white p-5" aria-live="polite">
                  {assistanceError && !shouldPromptAiConsent && <p className="mb-4 border-l-4 border-saffron bg-[#fff8e8] p-3 text-sm leading-6 text-ink">{assistanceError}</p>}
                  {assistanceResult && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-ink">สรุปเรื่องที่ระบบเข้าใจ</h3>
                        <span className="bg-paper px-3 py-1 text-xs font-bold text-river">{assistanceResult.mode === "ai" ? "AI ช่วยเรียบเรียง" : "รายการตรวจสอบในเครื่อง"}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">{assistanceResult.summary}</p>
                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-bold text-ink">ข้อมูลที่พบแล้ว</h4>
                          {assistanceResult.capturedFields.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
                              {assistanceResult.capturedFields.map((field) => <li key={field}>{field}</li>)}
                            </ul>
                          ) : <p className="mt-2 text-sm text-ink-soft">ยังไม่พบหัวข้อสำคัญชัดเจน</p>}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-ink">คำถามที่ควรตอบเพิ่ม</h4>
                          {assistanceResult.missingQuestions.length > 0 ? (
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
                              {assistanceResult.missingQuestions.map((question) => <li key={question}>{question}</li>)}
                            </ul>
                          ) : <p className="mt-2 text-sm text-ink-soft">ข้อมูลพื้นฐานครบตามรายการตรวจสอบแล้ว</p>}
                        </div>
                      </div>
                      <div className={`mt-5 border-l-4 p-4 ${assistanceResult.readiness.readyForReview ? "border-river bg-[#e9f4f2]" : "border-saffron bg-[#fff8e8]"}`}>
                        <p className="text-sm font-bold text-ink">
                          {assistanceResult.readiness.readyForReview
                            ? "ข้อมูลพร้อมให้คุณตรวจทานก่อนเข้าสู่การวิเคราะห์สิทธิและร่างหนังสือ"
                            : "ยังมีข้อมูลสำคัญที่ควรถามเพิ่มก่อนวิเคราะห์และร่างหนังสือ"}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-ink-soft">
                          พบข้อมูลแล้ว {assistanceResult.readiness.capturedCount} จาก {assistanceResult.readiness.totalCount} หัวข้อ
                          {assistanceResult.readiness.unavailableCount > 0 ? ` · ระบุว่าไม่ทราบ ${assistanceResult.readiness.unavailableCount} หัวข้อ` : ""}
                        </p>
                        {assistanceResult.unavailableFields.length > 0 && (
                          <p className="mt-2 text-xs leading-5 text-ink-soft">ข้อมูลที่ยังไม่ทราบ: {assistanceResult.unavailableFields.join(" · ")}</p>
                        )}
                      </div>
                      <p className="mt-5 text-xs leading-5 text-ink-soft">{assistanceResult.disclaimer}</p>
                    </>
                  )}
                </section>
              )}

              {assistanceResult?.mode === "ai" && assistanceResult.followUpQuestions.length > 0 && (
                <StoryInterview
                  key={interviewRound}
                  questions={assistanceResult.followUpQuestions}
                  isReviewing={isAnalyzingStory}
                  onReview={(answers) => void handleFollowUpReview(answers)}
                />
              )}

              <aside id="privacy-note" className="mt-8 border-l-4 border-river bg-[#e9f4f2] p-5 text-sm leading-6 text-ink">
                <strong className="block">แอปไม่บันทึกเรื่องหรือไฟล์เสียงของคุณ</strong>
                ข้อความอยู่ในหน่วยความจำชั่วคราวและจะหายเมื่อปิดหรือโหลดหน้าใหม่ ไม่ใช้ localStorage และไม่มีระบบบัญชีผู้ใช้
                {assistanceMode === "ai"
                  ? " เมื่อเลือก AI และยืนยัน ระบบจะส่งข้อความที่เล่าและคำตอบเพิ่มเติมไปประมวลผลชั่วคราว แต่ไม่บันทึกลงฐานข้อมูลของแอป ข้อมูลระบุตัวบุคคลสำหรับหนังสือจะกรอกในเบราว์เซอร์ภายหลังและไม่ส่งให้ AI"
                  : " โหมดนี้ตรวจรายการในเครื่องและไม่ส่งเรื่องไปให้ AI"}
                {" "}การแปลงเสียงจะทำในเครื่องเมื่อเบราว์เซอร์รองรับ มิฉะนั้นเบราว์เซอร์อาจใช้บริการออนไลน์ของผู้ให้บริการ
              </aside>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkflowStage("story");
                      setEmergencyStatus("checking");
                    }}
                    className="min-h-12 px-1 py-3 text-sm font-bold text-ink-soft underline underline-offset-4"
                  >
                    ← กลับไปตรวจเหตุเร่งด่วน
                  </button>
                  {assistanceResult && (
                    <button type="button" onClick={resetStoryAssistance} className="min-h-12 px-1 py-3 text-sm font-bold text-coral underline underline-offset-4">
                      ตรวจข้อเท็จจริงใหม่
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={continueFromFacts}
                  disabled={
                    story.trim().length < 20
                    || isAnalyzingStory
                    || Boolean(assistanceResult && !assistanceResult.readiness.readyForReview)
                  }
                  className="min-h-12 bg-ink px-7 py-3 font-bold text-white transition hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]"
                  title={assistanceResult?.readiness.readyForReview ? "ขั้นถัดไปคือดูสิทธิที่อาจเกี่ยวข้อง" : "จัดลำดับข้อเท็จจริงและตอบข้อมูลที่ขาดก่อน"}
                >
                  {isAnalyzingStory
                    ? "กำลังจัดเรื่อง…"
                    : assistanceResult?.readiness.readyForReview
                      ? "ดูสิทธิที่อาจเกี่ยวข้อง →"
                      : assistanceResult?.mode === "ai" && assistanceResult.followUpQuestions.length > 0
                        ? "ตอบคำถามเพิ่มเติมก่อน"
                        : assistanceResult
                          ? "เพิ่มข้อมูลที่ขาดก่อน"
                          : assistanceMode === "ai"
                            ? "จัดลำดับข้อเท็จจริงด้วย AI →"
                            : "จัดลำดับข้อเท็จจริง →"}
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
      <EmergencyShortcut />
    </div>
  );
}
