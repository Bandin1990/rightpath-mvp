export type AssistanceMode = "rules" | "ai";

export type StoryAssistanceResult = {
  mode: AssistanceMode;
  summary: string;
  capturedFields: string[];
  missingQuestions: string[];
  disclaimer: string;
};

const factChecks = [
  {
    label: "ช่วงเวลาหรือวันที่เกิดเหตุ",
    pattern: /(เมื่อ|วันที่|เวลา|วันนี้|เมื่อวาน|สัปดาห์|เดือน|ปี|เช้า|บ่าย|เย็น|กลางคืน)/u,
    question: "เหตุเกิดวันหรือช่วงเวลาใด และยังเกิดขึ้นอยู่หรือไม่",
  },
  {
    label: "สถานที่หรือช่องทางที่เกิดเหตุ",
    pattern: /(จังหวัด|อำเภอ|ตำบล|หมู่บ้าน|บ้าน|ที่ทำงาน|โรงงาน|โรงเรียน|โรงพยาบาล|ออนไลน์|เว็บไซต์|แอป|บัญชี)/u,
    question: "เหตุเกิดที่ใด หรือเกิดผ่านเว็บไซต์ แอป หรือบัญชีใด",
  },
  {
    label: "บุคคลหรือหน่วยงานที่เกี่ยวข้อง",
    pattern: /(เจ้าหน้าที่|ตำรวจ|นายจ้าง|บริษัท|หน่วยงาน|เทศบาล|โรงพยาบาล|โรงเรียน|บุคคล|เพื่อนบ้าน|ผู้ขาย|ผู้กระทำ)/u,
    question: "ใครหรือหน่วยงานใดเกี่ยวข้อง และแต่ละฝ่ายทำหรือไม่ทำอะไร",
  },
  {
    label: "ผลกระทบหรือความเสียหาย",
    pattern: /(เสียหาย|เดือดร้อน|กระทบ|บาดเจ็บ|เจ็บป่วย|เงิน|ทรัพย์สิน|รายได้|กลัว|กังวล|ถูกขู่|ข้อมูล)/u,
    question: "คุณหรือผู้อื่นได้รับผลกระทบต่อชีวิต สุขภาพ เงิน ทรัพย์สิน หรือความปลอดภัยอย่างไร",
  },
  {
    label: "สิ่งที่เคยดำเนินการ",
    pattern: /(แจ้ง|ร้องเรียน|ติดต่อ|โทร|ยื่น|ส่งหนังสือ|เคยดำเนินการ|เลขรับ|ได้รับคำตอบ)/u,
    question: "ที่ผ่านมาเคยแจ้งหรือติดต่อใครแล้วหรือไม่ และได้รับคำตอบหรือเลขรับเรื่องหรือไม่",
  },
  {
    label: "ผลลัพธ์ที่ต้องการ",
    pattern: /(ต้องการ|อยากให้|ขอให้|ประสงค์|เยียวยา|ชดเชย|หยุด|ตรวจสอบ|ชี้แจง)/u,
    question: "คุณต้องการให้ปัญหาจบลงอย่างไร หรืออยากให้หน่วยงานช่วยเรื่องใด",
  },
] as const;

export function createRuleBasedStoryAssistance(story: string): StoryAssistanceResult {
  const normalizedStory = story.replace(/\s+/gu, " ").trim();
  const capturedFields: string[] = [];
  const missingQuestions: string[] = [];

  for (const check of factChecks) {
    if (check.pattern.test(normalizedStory)) capturedFields.push(check.label);
    else missingQuestions.push(check.question);
  }

  return {
    mode: "rules",
    summary: normalizedStory,
    capturedFields,
    missingQuestions,
    disclaimer: "ผลนี้มาจากรายการตรวจสอบในเครื่อง ไม่ได้ใช้ AI และยังไม่ใช่ข้อวินิจฉัยทางกฎหมาย",
  };
}
