export type AssistanceMode = "rules" | "ai";

export const storyQuestionCatalog = [
  {
    id: "incident_time",
    label: "วัน เวลา และความต่อเนื่องของเหตุ",
    question: "เหตุเกิดวันหรือช่วงเวลาใด และขณะนี้เหตุยังเกิดขึ้นอยู่หรือไม่",
    purpose: "ใช้จัดลำดับเหตุการณ์และตรวจเรื่องกำหนดเวลา",
    pattern: /(เมื่อ|วันที่|เวลา|วันนี้|เมื่อวาน|สัปดาห์|เดือน|ปี|เช้า|บ่าย|เย็น|กลางคืน|ยังเกิด|สิ้นสุด)/u,
  },
  {
    id: "incident_place",
    label: "สถานที่หรือช่องทางที่เกิดเหตุ",
    question: "เหตุเกิดที่ใด หรือเกิดผ่านเว็บไซต์ แอป หรือบัญชีใด",
    purpose: "ใช้ระบุพื้นที่รับผิดชอบและช่องทางที่เกิดเหตุ",
    pattern: /(จังหวัด|อำเภอ|ตำบล|หมู่บ้าน|บ้าน|ที่ทำงาน|โรงงาน|โรงเรียน|โรงพยาบาล|ออนไลน์|เว็บไซต์|แอป|บัญชี)/u,
  },
  {
    id: "involved_parties",
    label: "บุคคลหรือหน่วยงานที่เกี่ยวข้อง",
    question: "บุคคลหรือหน่วยงานใดเกี่ยวข้อง กรุณาระบุบทบาทโดยไม่ต้องใส่เลขประจำตัวหรือข้อมูลติดต่อส่วนตัว",
    purpose: "ใช้ระบุผู้ถูกร้องและผู้ที่อาจมีหน้าที่แก้ปัญหา",
    pattern: /(เจ้าหน้าที่|ตำรวจ|นายจ้าง|บริษัท|หน่วยงาน|เทศบาล|โรงพยาบาล|โรงเรียน|บุคคล|เพื่อนบ้าน|ผู้ขาย|ผู้กระทำ)/u,
  },
  {
    id: "actions_or_omissions",
    label: "การกระทำหรือสิ่งที่ไม่ได้ดำเนินการ",
    question: "แต่ละฝ่ายทำอะไร หรือมีหน้าที่ใดที่ไม่ได้ดำเนินการ กรุณาเล่าตามที่พบโดยไม่ต้องใช้ข้อกล่าวหาทางกฎหมาย",
    purpose: "ใช้เขียนข้อเท็จจริงในหนังสือโดยแยกจากความเห็น",
    pattern: /(ทำ|ไม่ทำ|ปฏิเสธ|ละเลย|สั่ง|ยึด|ห้าม|แจ้ง|เผยแพร่|หลอก|ข่มขู่|เลิกจ้าง|ไม่รับเรื่อง)/u,
  },
  {
    id: "information_source",
    label: "ที่มาของข้อมูล",
    question: "ส่วนใดที่คุณพบเห็นหรือประสบเอง และส่วนใดที่ทราบจากผู้อื่นหรือเป็นข้อสงสัย",
    purpose: "ใช้แยกข้อเท็จจริงโดยตรง คำบอกเล่า และข้อสันนิษฐาน",
    pattern: /(พบเห็น|เห็นเอง|ประสบเอง|ได้ยิน|มีคนบอก|ทราบจาก|คาดว่า|สงสัย|เชื่อว่า)/u,
  },
  {
    id: "impact",
    label: "ผลกระทบหรือความเสียหาย",
    question: "คุณหรือผู้อื่นได้รับผลกระทบต่อชีวิต สุขภาพ เงิน ทรัพย์สิน งาน ความเป็นส่วนตัว หรือความปลอดภัยอย่างไร",
    purpose: "ใช้แสดงความเดือดร้อนและความจำเป็นในการช่วยเหลือ",
    pattern: /(เสียหาย|เดือดร้อน|กระทบ|บาดเจ็บ|เจ็บป่วย|เงิน|ทรัพย์สิน|รายได้|งาน|กลัว|กังวล|ถูกขู่|ข้อมูล)/u,
  },
  {
    id: "prior_actions",
    label: "สิ่งที่เคยดำเนินการ",
    question: "ที่ผ่านมาเคยแจ้งหรือติดต่อใครแล้วหรือไม่ และได้รับคำตอบหรือเลขรับเรื่องหรือไม่",
    purpose: "ใช้แสดงความพยายามแก้ปัญหาและวางขั้นตอนถัดไป",
    pattern: /(แจ้ง|ร้องเรียน|ติดต่อ|โทร|ยื่น|ส่งหนังสือ|เคยดำเนินการ|เลขรับ|ได้รับคำตอบ)/u,
  },
  {
    id: "desired_outcome",
    label: "ผลลัพธ์ที่ต้องการ",
    question: "คุณต้องการให้ปัญหาจบลงอย่างไร หรืออยากให้หน่วยงานช่วยดำเนินการเรื่องใด",
    purpose: "ใช้กำหนดคำขอที่ชัดเจนและอยู่ในขอบเขตหน่วยงาน",
    pattern: /(ต้องการ|อยากให้|ขอให้|ประสงค์|เยียวยา|ชดเชย|หยุด|ตรวจสอบ|ชี้แจง)/u,
  },
  {
    id: "evidence",
    label: "หลักฐานที่มีหรือหาได้",
    question: "มีหลักฐานประเภทใดบ้าง เช่น หนังสือ ภาพ ข้อความ ใบเสร็จ เลขรับเรื่อง หรือพยาน ไม่ต้องอัปโหลดหรือใส่ข้อมูลลับในขั้นนี้",
    purpose: "ใช้จัดทำบัญชีหลักฐานโดยไม่ส่งไฟล์ให้ AI",
    pattern: /(หลักฐาน|หนังสือ|ภาพ|วิดีโอ|ข้อความ|แชต|ใบเสร็จ|สลิป|พยาน|เลขรับเรื่อง|คำสั่ง)/u,
  },
  {
    id: "case_or_deadline",
    label: "คดี วันนัด หรือกำหนดเวลาที่เกี่ยวข้อง",
    question: "เรื่องนี้อยู่ระหว่างคดี มีหมายเรียก วันนัด หรือกำหนดเวลาที่ใกล้ถึงหรือไม่ หากไม่ทราบสามารถเลือก “ไม่ทราบ” ได้",
    purpose: "ใช้หลีกเลี่ยงการพลาดกำหนดเวลาและเลือกช่องทางที่ขัดกับคดีเดิม",
    pattern: /(คดี|ศาล|หมายเรียก|วันนัด|นัดหมาย|อายุความ|กำหนดเวลา|ภายใน.*วัน|ครบกำหนด)/u,
  },
  {
    id: "safety_and_privacy",
    label: "ความปลอดภัยและการเปิดเผยตัวตน",
    question: "หากดำเนินการต่อ มีความกังวลเรื่องการถูกตอบโต้ ข่มขู่ เปิดเผยชื่อ หรือกระทบคนอื่นหรือไม่",
    purpose: "ใช้วางมาตรการลดความเสี่ยงก่อนร้องเรียน",
    pattern: /(ตอบโต้|ข่มขู่|ปกปิด|ไม่เปิดเผย|เปิดเผยชื่อ|ความปลอดภัย|กลัว|คุ้มครองพยาน|ข้อมูลส่วนตัว)/u,
  },
] as const;

export type StoryQuestionId = (typeof storyQuestionCatalog)[number]["id"];
export type FollowUpAnswerStatus = "answered" | "unknown" | "skipped";

export type StoryFollowUpQuestion = {
  id: StoryQuestionId;
  label: string;
  question: string;
  purpose: string;
};

export type StoryFollowUpAnswer = {
  questionId: StoryQuestionId;
  status: FollowUpAnswerStatus;
  answer: string;
};

export type StoryReadiness = {
  readyForReview: boolean;
  capturedCount: number;
  totalCount: number;
  unavailableCount: number;
};

export type StoryAssistanceResult = {
  mode: AssistanceMode;
  summary: string;
  capturedFields: string[];
  missingQuestions: string[];
  followUpQuestions: StoryFollowUpQuestion[];
  unavailableFields: string[];
  readiness: StoryReadiness;
  disclaimer: string;
};

export const storyQuestionIds = storyQuestionCatalog.map((question) => question.id) as [StoryQuestionId, ...StoryQuestionId[]];

export function getStoryQuestion(questionId: StoryQuestionId) {
  return storyQuestionCatalog.find((question) => question.id === questionId);
}

export function toFollowUpQuestion(question: (typeof storyQuestionCatalog)[number]): StoryFollowUpQuestion {
  return {
    id: question.id,
    label: question.label,
    question: question.question,
    purpose: question.purpose,
  };
}

export function createRuleBasedStoryAssistance(story: string): StoryAssistanceResult {
  const normalizedStory = story.replace(/\s+/gu, " ").trim();
  const capturedQuestions = storyQuestionCatalog.filter((question) => question.pattern.test(normalizedStory));
  const missingQuestionCatalog = storyQuestionCatalog.filter((question) => !question.pattern.test(normalizedStory));
  const followUpQuestions = missingQuestionCatalog.slice(0, 8).map(toFollowUpQuestion);

  return {
    mode: "rules",
    summary: normalizedStory,
    capturedFields: capturedQuestions.map((question) => question.label),
    missingQuestions: followUpQuestions.map((question) => question.question),
    followUpQuestions,
    unavailableFields: [],
    readiness: {
      readyForReview: missingQuestionCatalog.length === 0,
      capturedCount: capturedQuestions.length,
      totalCount: storyQuestionCatalog.length,
      unavailableCount: 0,
    },
    disclaimer: "ผลนี้มาจากรายการตรวจสอบในเครื่อง ไม่ได้ใช้ AI และยังไม่ใช่ข้อวินิจฉัยทางกฎหมาย",
  };
}
