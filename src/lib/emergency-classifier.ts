import { urgentThreatGroups, type UrgentThreat, type UrgentThreatGroup } from "@/lib/emergency-guidance";

export type EmergencyTextMatch = {
  threat: UrgentThreat;
  matchedKeywords: string[];
  score: number;
};

// This vocabulary is reviewed content, not a language-model prompt. In production it
// is replaced by the published emergency_threat_keywords rows managed in /admin.
export const emergencyThreatKeywords: Record<string, string[]> = {
  "death-threat-weapons": ["ขู่ฆ่า", "เอาชีวิต", "จะฆ่า", "ปืน", "มีด", "อาวุธ", "ตามทำร้าย", "รู้ที่อยู่บ้าน"],
  "assault-confinement-kidnap": ["ทำร้าย", "ถูกตี", "ถูกซ้อม", "กักขัง", "ลักพาตัว", "จับตัว", "หนีไม่ได้"],
  "domestic-sexual-violence": ["ความรุนแรงในครอบครัว", "สามีทำร้าย", "ภรรยาทำร้าย", "ล่วงละเมิดทางเพศ", "ข่มขืน", "คุกคามทางเพศ"],
  "missing-at-risk": ["หายตัว", "สูญหาย", "ติดต่อไม่ได้", "เด็กหาย", "ผู้สูงอายุหาย"],
  "vulnerable-person-danger": ["เด็กถูกทำร้าย", "ผู้สูงอายุถูกทำร้าย", "คนพิการถูกทำร้าย", "ไม่มีที่ปลอดภัย", "ถูกทอดทิ้ง"],
  "trafficking-forced-labor": ["ค้ามนุษย์", "บังคับทำงาน", "ยึดพาสปอร์ต", "บังคับค้าประเวณี", "หลอกไปทำงาน", "กักแรงงาน"],
  "unrest-suspicious-object": ["วัตถุต้องสงสัย", "ระเบิด", "กราดยิง", "ก่อการร้าย", "เหตุจลาจล"],
  "unconscious-breathing-stroke": ["หมดสติ", "ไม่หายใจ", "หายใจไม่ออก", "เจ็บหน้าอก", "ปากเบี้ยว", "แขนขาอ่อนแรง", "ชัก"],
  "severe-injury-bleeding": ["เลือดออกมาก", "บาดเจ็บสาหัส", "แผลลึก", "แขนขาด", "ขาขาด", "กระดูกหัก", "ถูกยิง", "ถูกแทง"],
  "poison-overdose": ["กินยาเกินขนาด", "ได้รับพิษ", "กินสารพิษ", "สูดสารเคมี", "แพ้รุนแรง"],
  "self-harm-suicide": ["ฆ่าตัวตาย", "ทำร้ายตัวเอง", "ไม่อยากมีชีวิต", "อยากตาย", "วางแผนตาย"],
  "pregnancy-emergency": ["คลอดฉุกเฉิน", "เจ็บท้องคลอด", "ตั้งครรภ์เลือดออก", "ลูกไม่ดิ้น"],
  "robbery-theft-in-progress": ["ถูกปล้น", "ถูกชิงทรัพย์", "ขโมยรถ", "โจรขึ้นบ้าน", "บุกรุกบ้าน", "ขโมยกำลังอยู่"],
  "scam-transfer": ["หลอกโอนเงิน", "มิจฉาชีพ", "ซื้อของแล้วไม่ได้", "ลงทุนปลอม", "กู้เงินออนไลน์", "แก๊งคอลเซ็นเตอร์", "เพิ่งโอนเงิน"],
  "unauthorized-transaction": ["เงินถูกโอน", "เงินหายจากบัญชี", "ตัดบัตร", "รูดบัตร", "ถอนเงินไม่ได้อนุญาต", "รายการที่ไม่ได้ทำ"],
  "banking-takeover": ["แอปดูดเงิน", "โมบายแบงก์กิ้งถูกแฮก", "otp", "ซิมถูกยึด", "บัตรถูกขโมย", "ควบคุมหน้าจอ"],
  "extortion-ransom": ["รีดไถ", "แบล็กเมล", "เรียกค่าไถ่", "ขู่ให้โอน", "ขู่เอาเงิน"],
  "social-email-hacked": ["โซเชียลถูกแฮก", "เฟซบุ๊กถูกแฮก", "facebook ถูกแฮก", "ไลน์ถูกแฮก", "line ถูกแฮก", "อีเมลถูกแฮก", "เข้าไอจีไม่ได้", "บัญชีถูกแฮก"],
  "impersonation-fake-account": ["บัญชีปลอม", "สวมรอย", "ปลอมโปรไฟล์", "ใช้รูปไปหลอก", "แอบอ้างชื่อ"],
  "malware-ransomware": ["มัลแวร์", "ransomware", "คอมถูกล็อก", "มือถือถูกควบคุม", "ไวรัสเรียกค่าไถ่", "ไฟล์ถูกเข้ารหัส"],
  "data-leak-doxxing": ["ข้อมูลรั่ว", "เลขบัตรถูกเผยแพร่", "ที่อยู่ถูกเผยแพร่", "เบอร์โทรถูกเผยแพร่", "เปิดเผยข้อมูลส่วนตัว", "doxxing"],
  "forged-deepfake-harmful-content": ["ปลอมเอกสาร", "deepfake", "ดีปเฟก", "ปลอมภาพ", "ปลอมเสียง", "ข่าวปลอมใส่ร้าย", "เผยแพร่ข้อมูลเสียหาย"],
  "intimate-image-child-content": ["ขู่ปล่อยรูป", "ปล่อยคลิป", "ภาพลับ", "คลิปลับ", "ภาพโป๊เด็ก", "ภาพทางเพศ", "sextortion"],
  "fire-explosion-chemical": ["ไฟไหม้", "เพลิงไหม้", "แก๊สรั่ว", "สารเคมีรั่ว", "กลิ่นสารเคมี", "ควันพิษ", "เกิดระเบิด"],
  "building-electrical-collapse": ["อาคารถล่ม", "ตึกถล่ม", "ไฟฟ้ารั่ว", "สายไฟขาด", "ติดในลิฟต์", "สิ่งปลูกสร้างพัง"],
  "flood-storm-landslide-earthquake": ["น้ำท่วม", "น้ำป่า", "พายุ", "ไฟป่า", "ดินถล่ม", "แผ่นดินไหว", "ต้องอพยพ"],
  "transport-accident": ["รถชน", "รถคว่ำ", "อุบัติเหตุทางถนน", "รถไฟชน", "เรือล่ม", "เครื่องบินตก"],
  "drowning-lost-trapped": ["จมน้ำ", "ติดในรถ", "ติดในอาคาร", "หลงป่า", "ติดถ้ำ", "ออกมาไม่ได้"],
};

const ignoredFragments = new Set(["กำลัง", "มีคน", "ของฉัน", "ของผม", "ของหนู", "ถูก", "โดน", "เรื่อง", "ปัญหา"]);

function normalizeThaiText(value: string) {
  return value.toLocaleLowerCase("th-TH").replace(/[\s\u200B\u200C\u200D]+/g, " ").trim();
}

function usefulLabelFragments(label: string) {
  return normalizeThaiText(label)
    .split(/[\s/,()]+/)
    .filter((fragment) => fragment.length >= 4 && !ignoredFragments.has(fragment));
}

export function classifyEmergencyText(
  input: string,
  options: { limit?: number; threatGroups?: UrgentThreatGroup[]; keywords?: Record<string, string[]> } = {},
): EmergencyTextMatch[] {
  const normalizedInput = normalizeThaiText(input);
  if (normalizedInput.length < 3) return [];
  const limit = options.limit ?? 3;
  const allThreats = (options.threatGroups ?? urgentThreatGroups).flatMap((group) => group.threats);
  const keywordCatalog = options.keywords ?? emergencyThreatKeywords;

  return allThreats
    .map((threat) => {
      const reviewedKeywords = keywordCatalog[threat.id] ?? [];
      const labelFragments = usefulLabelFragments(threat.label);
      const matchedReviewed = reviewedKeywords.filter((keyword) => normalizedInput.includes(normalizeThaiText(keyword)));
      const matchedLabel = labelFragments.filter((fragment) => normalizedInput.includes(fragment));
      const longestReviewed = Math.max(0, ...matchedReviewed.map((keyword) => keyword.length));
      const score = matchedReviewed.length * 5 + matchedLabel.length + longestReviewed / 20;

      return {
        threat,
        matchedKeywords: [...new Set([...matchedReviewed, ...matchedLabel])],
        score,
      };
    })
    .filter((match) => match.score >= 5)
    .sort((left, right) => right.score - left.score)
    .filter((match, index, matches) => index === 0 || match.score >= matches[0].score * 0.62)
    .slice(0, Math.max(1, limit));
}
