import type { ActionOptionId } from "@/lib/action-options";

export type ComplaintTypeId =
  | "state-action"
  | "human-rights"
  | "environment"
  | "consumer"
  | "labour"
  | "privacy-digital"
  | "fraud-cyber"
  | "official-information"
  | "local-problem"
  | "general";

export type KnowledgeSource = {
  label: string;
  url: string;
};

export type ComplaintTypeMatch = {
  id: ComplaintTypeId;
  label: string;
  matchedKeywords: string[];
};

export type AgencyChannel = {
  type: "phone" | "website" | "email";
  label: string;
  href: string;
  detail?: string;
};

export type AgencyGuidance = {
  id: string;
  name: string;
  summary: string;
  canDo: string;
  cannotDo: string;
  complaintTypes: ComplaintTypeId[];
  channels: AgencyChannel[];
  source: KnowledgeSource;
  lastVerifiedAt: string;
};

export type SuggestedAgency = AgencyGuidance & {
  reason: string;
  matchedComplaintTypes: ComplaintTypeId[];
  rank: "หลัก" | "สนับสนุน" | "ทางเลือก";
};

export type RiskSeverity = "low" | "caution" | "seek_help_first";

export type RiskAssessment = {
  id: "safety" | "privacy" | "retaliation" | "allegation" | "time" | "evidence";
  title: string;
  severity: RiskSeverity;
  explanation: string;
  mitigation: string;
  source: KnowledgeSource;
  lastVerifiedAt: string;
};

export type FinalDecision = "complaint" | "consult" | "prepare";

export const finalDecisionOptions: Array<{
  id: FinalDecision;
  title: string;
  description: string;
  nextResult: string;
}> = [
  {
    id: "complaint",
    title: "ร้องเรียนอย่างเป็นทางการ",
    description: "เหมาะเมื่อข้อมูลพร้อม ความเสี่ยงอยู่ในระดับที่รับได้ และต้องการหลักฐานการรับเรื่อง",
    nextResult: "ระบบจะสร้างหนังสือร้องเรียน บัญชีหลักฐาน และวิธีส่ง",
  },
  {
    id: "consult",
    title: "ขอคำปรึกษาก่อน",
    description: "เหมาะเมื่อเรื่องซับซ้อน ไม่แน่ใจเรื่องอำนาจหน่วยงาน กำหนดเวลา หรือการเปิดเผยข้อมูล",
    nextResult: "ระบบจะสร้างสรุปขอคำปรึกษาและรายการคำถามสำหรับเจ้าหน้าที่",
  },
  {
    id: "prepare",
    title: "ยังไม่ร้อง ขอเก็บข้อมูลเพิ่ม",
    description: "เหมาะเมื่อหลักฐานยังไม่ครบ ยังไม่พร้อมเปิดเผยตัวตน หรือจำเป็นต้องวางแผนความปลอดภัยก่อน",
    nextResult: "ระบบจะสร้างแผนเก็บหลักฐานและรายการเตรียมความพร้อม",
  },
];

const verifiedAt = "2 สิงหาคม 2569";

const complaintTypeRules: Array<{ id: ComplaintTypeId; label: string; keywords: string[]; strongKeywords: string[] }> = [
  {
    id: "environment",
    label: "สิ่งแวดล้อมและมลพิษ",
    keywords: ["มลพิษ", "น้ำเสีย", "ควัน", "ฝุ่น", "กลิ่น", "เสียงดัง", "โรงงาน", "สารเคมี", "ขยะ", "สิ่งแวดล้อม", "ชุมชน"],
    strongKeywords: ["มลพิษ", "น้ำเสีย", "ปล่อยควัน", "ฝุ่นจากโรงงาน", "กลิ่นเหม็น", "สารเคมี", "ปนเปื้อน"],
  },
  {
    id: "labour",
    label: "แรงงานและการจ้างงาน",
    keywords: ["นายจ้าง", "ลูกจ้าง", "ค่าจ้าง", "เงินเดือน", "เลิกจ้าง", "แรงงาน", "วันลา", "ทำงาน", "ประกันสังคม"],
    strongKeywords: ["นายจ้าง", "ลูกจ้าง", "ไม่จ่ายค่าจ้าง", "ค้างค่าจ้าง", "เลิกจ้าง", "ค่าล่วงเวลา", "ประกันสังคม"],
  },
  {
    id: "consumer",
    label: "ผู้บริโภค สินค้า และบริการ",
    keywords: ["สินค้า", "บริการ", "ผู้ขาย", "ร้านค้า", "ซื้อ", "สั่งซื้อ", "โฆษณา", "สัญญา", "คืนเงิน", "ผู้บริโภค"],
    strongKeywords: ["ซื้อสินค้า", "สั่งซื้อ", "ผู้ขาย", "ร้านค้า", "คืนเงิน", "ไม่ได้รับสินค้า", "สินค้าไม่ตรงปก", "โฆษณาเกินจริง"],
  },
  {
    id: "privacy-digital",
    label: "ข้อมูลส่วนบุคคลและสิทธิออนไลน์",
    keywords: ["ข้อมูลส่วนบุคคล", "ข้อมูลส่วนตัว", "เปิดเผยข้อมูล", "เผยแพร่", "ประจาน", "รูป", "คลิป", "สวมรอย", "ปลอมบัญชี"],
    strongKeywords: ["ข้อมูลส่วนบุคคล", "เปิดเผยข้อมูล", "เผยแพร่ข้อมูลส่วนตัว", "สวมรอย", "ปลอมบัญชี", "เผยแพร่คลิป", "เผยแพร่ภาพ"],
  },
  {
    id: "fraud-cyber",
    label: "หลอกลวงทางการเงินและอาชญากรรมออนไลน์",
    keywords: ["หลอกโอน", "โอนเงิน", "โกง", "มิจฉาชีพ", "บัญชีถูกแฮก", "แฮกบัญชี", "ดูดเงิน", "ภัยออนไลน์", "ไซเบอร์"],
    strongKeywords: ["หลอกโอน", "มิจฉาชีพ", "บัญชีถูกแฮก", "แฮกบัญชี", "ดูดเงิน", "โกงเงิน"],
  },
  {
    id: "official-information",
    label: "การขอข้อมูลข่าวสารของราชการ",
    keywords: ["ขอข้อมูลข่าวสาร", "ขอเอกสาร", "ไม่ให้ข้อมูล", "ปฏิเสธเปิดเผย", "ปฏิเสธข้อมูล", "หนังสือปฏิเสธ", "ข้อมูลของราชการ"],
    strongKeywords: ["ขอข้อมูลข่าวสาร", "ขอเอกสาร", "ไม่ให้ข้อมูล", "ปฏิเสธเปิดเผย", "ไม่ตอบคำขอข้อมูล"],
  },
  {
    id: "state-action",
    label: "การกระทำหรือการละเลยของหน่วยงานรัฐ",
    keywords: ["เจ้าหน้าที่", "หน่วยงาน", "ราชการ", "รัฐ", "ตำรวจ", "เทศบาล", "อบต", "อำเภอ", "จังหวัด", "กรม", "กระทรวง", "เพิกเฉย", "ไม่รับเรื่อง"],
    strongKeywords: ["ไม่รับเรื่อง", "เพิกเฉย", "ไม่ดำเนินการ", "ละเลยหน้าที่", "ใช้อำนาจไม่เป็นธรรม", "เจ้าหน้าที่ปฏิเสธ", "หน่วยงานไม่ตอบ"],
  },
  {
    id: "local-problem",
    label: "ความเดือดร้อนในพื้นที่",
    keywords: ["ชุมชน", "หมู่บ้าน", "ท้องถิ่น", "เทศบาล", "อบต", "อำเภอ", "จังหวัด", "ถนน", "สาธารณะ"],
    strongKeywords: ["ปัญหาในชุมชน", "ถนนชำรุด", "ที่สาธารณะ", "เทศบาลไม่", "อบตไม่", "ร้องศูนย์ดำรงธรรม"],
  },
  {
    id: "human-rights",
    label: "สิทธิมนุษยชนและการเลือกปฏิบัติ",
    keywords: ["ละเมิดสิทธิ", "สิทธิมนุษยชน", "เลือกปฏิบัติ", "ไม่เป็นธรรม", "ข่มขู่", "ทำร้าย", "กักขัง", "คุกคาม", "เหยียด"],
    strongKeywords: ["ละเมิดสิทธิ", "สิทธิมนุษยชน", "เลือกปฏิบัติ", "ขู่ฆ่า", "ทำร้ายร่างกาย", "กักขัง", "ทรมาน", "เหยียด"],
  },
];

const agencyCatalog: AgencyGuidance[] = [
  {
    id: "pcd",
    name: "กรมควบคุมมลพิษ",
    summary: "ช่องทางรับเรื่องร้องเรียนด้านมลพิษและแหล่งกำเนิดมลพิษ",
    canDo: "รับเรื่อง ตรวจข้อมูลเบื้องต้น ประสานหรือตรวจสอบตามอำนาจหน้าที่ด้านมลพิษ และส่งต่อหน่วยงานพื้นที่เมื่อเกี่ยวข้อง",
    cannotDo: "ไม่ทดแทนการกู้ภัยหรือการแพทย์ฉุกเฉิน และอาจส่งต่อเมื่อเรื่องอยู่ในอำนาจของท้องถิ่นหรือหน่วยงานเฉพาะ",
    complaintTypes: ["environment"],
    channels: [
      { type: "phone", label: "โทร 1650", href: "tel:1650", detail: "สายด่วนกรมควบคุมมลพิษ" },
      { type: "website", label: "แจ้งผ่านระบบ ECAP", href: "https://ecap.pcd.go.th/ecap/home/defaulted" },
    ],
    source: { label: "ระบบรับแจ้งเรื่องร้องเรียนด้านมลพิษ กรมควบคุมมลพิษ", url: "https://ecap.pcd.go.th/ecap/home/defaulted" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "dlpw",
    name: "กรมสวัสดิการและคุ้มครองแรงงาน",
    summary: "รับคำร้องเกี่ยวกับค่าจ้าง ค่าล่วงเวลา วันลา สภาพการทำงาน และการเลิกจ้าง",
    canDo: "ให้คำปรึกษา รับคำร้อง และให้พนักงานตรวจแรงงานตรวจข้อเท็จจริงหรือออกคำสั่งตามอำนาจในปัญหาคุ้มครองแรงงาน",
    cannotDo: "ปัญหาประกันสังคม การจัดหางาน หรือข้อพิพาทที่ต้องฟ้องศาลอาจต้องใช้หน่วยงานหรือกระบวนการอื่น",
    complaintTypes: ["labour"],
    channels: [
      { type: "phone", label: "โทร 1506 กด 3", href: "tel:1506", detail: "กรมสวัสดิการและคุ้มครองแรงงาน" },
      { type: "website", label: "ยื่นคำร้องผ่าน e-Service", href: "https://eservice.labour.go.th/register/esrvq101/lcs" },
      { type: "website", label: "ระบบรับเรื่องร้องทุกข์ กระทรวงแรงงาน", href: "https://petition.mol.go.th/" },
    ],
    source: { label: "บริการร้องเรียน กระทรวงแรงงาน", url: "https://www.mol.go.th/service-complaint" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "ocpb",
    name: "สำนักงานคณะกรรมการคุ้มครองผู้บริโภค",
    summary: "รับเรื่องจากการซื้อสินค้า ใช้บริการ โฆษณา และสัญญาผู้บริโภค",
    canDo: "ให้คำปรึกษา รับเรื่องร้องทุกข์ ประสานผู้ประกอบธุรกิจ และดำเนินกระบวนการคุ้มครองผู้บริโภคตามอำนาจ",
    cannotDo: "ปัญหาสินค้าหรือบริการบางประเภทอาจอยู่กับหน่วยงานกำกับเฉพาะ และการยื่นออนไลน์ต้องสมัครบัญชีของหน่วยงาน",
    complaintTypes: ["consumer"],
    channels: [
      { type: "phone", label: "โทร 1166", href: "tel:1166" },
      { type: "website", label: "ร้องทุกข์ออนไลน์", href: "https://complaint.ocpb.go.th/" },
    ],
    source: { label: "OCPB Connect สำนักงานคณะกรรมการคุ้มครองผู้บริโภค", url: "https://ocpbconnect.ocpb.go.th/" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "pdpc",
    name: "สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล",
    summary: "ช่องทางร้องเรียนกรณีการเก็บ ใช้ เปิดเผย หรือดูแลข้อมูลส่วนบุคคลโดยไม่ชอบ",
    canDo: "รับคำร้องเรียนตามกฎหมายคุ้มครองข้อมูลส่วนบุคคลและพิจารณาการดำเนินการกับผู้ควบคุมหรือผู้ประมวลผลข้อมูล",
    cannotDo: "ไม่ทดแทนตำรวจเมื่อมีการแฮก หลอกโอนเงิน ข่มขู่ หรืออาชญากรรมที่กำลังเกิดขึ้น",
    complaintTypes: ["privacy-digital"],
    channels: [
      { type: "website", label: "ระบบรับเรื่องร้องเรียน", href: "https://complaint.pdpc.or.th/" },
      { type: "website", label: "ข้อมูลติดต่อ สคส.", href: "https://gppc.pdpc.or.th/contact-us/" },
    ],
    source: { label: "ระบบรับเรื่องร้องเรียน สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล", url: "https://complaint.pdpc.or.th/" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "ccib",
    name: "ตำรวจไซเบอร์",
    summary: "รับแจ้งความออนไลน์และให้ความช่วยเหลือกรณีอาชญากรรมทางเทคโนโลยี",
    canDo: "รับแจ้งความคดีออนไลน์ ตรวจสอบเหตุอาชญากรรมทางเทคโนโลยี และประสานการดำเนินคดี",
    cannotDo: "หากเงินกำลังถูกโอนหรือบัญชียังถูกยึดครอง ควรโทร 1441 และติดต่อธนาคารทันที ไม่ควรรอทำหนังสือ",
    complaintTypes: ["fraud-cyber", "privacy-digital"],
    channels: [
      { type: "phone", label: "โทร 1441", href: "tel:1441", detail: "ตลอด 24 ชั่วโมง" },
      { type: "website", label: "แจ้งความออนไลน์", href: "https://www.thaipoliceonline.go.th/" },
    ],
    source: { label: "กองบัญชาการตำรวจสืบสวนสอบสวนอาชญากรรมทางเทคโนโลยี", url: "https://www.thaipoliceonline.go.th/" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "oic",
    name: "สำนักงานคณะกรรมการข้อมูลข่าวสารของราชการ",
    summary: "รับเรื่องร้องเรียนหรืออุทธรณ์เมื่อหน่วยงานรัฐไม่เปิดเผยข้อมูล ไม่ตอบคำขอ หรือมีคำสั่งปฏิเสธ",
    canDo: "รับเรื่องร้องเรียนและอุทธรณ์ตามกฎหมายข้อมูลข่าวสารของราชการ พร้อมออกเลขคำร้องสำหรับติดตามในระบบดิจิทัล",
    cannotDo: "ต้องแยกให้ถูกว่าเป็นกรณีไม่ได้รับคำตอบหรือเป็นการอุทธรณ์คำสั่งปฏิเสธ และควรมีสำเนาคำขอเดิมหรือหนังสือปฏิเสธ",
    complaintTypes: ["official-information"],
    channels: [
      { type: "website", label: "ร้องเรียนหรืออุทธรณ์ออนไลน์", href: "https://www.oic.go.th/e-ca/admin_oic_eca/home.aspx" },
      { type: "phone", label: "โทร 0 2283 4000 ต่อ 17", href: "tel:022834000", detail: "สำนักงานคณะกรรมการข้อมูลข่าวสารของราชการ" },
    ],
    source: { label: "ระบบจัดการเรื่องร้องเรียนและอุทธรณ์ด้วยระบบดิจิทัล สขร.", url: "https://www.oic.go.th/e-ca/admin_oic_eca/home.aspx" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "ombudsman",
    name: "สำนักงานผู้ตรวจการแผ่นดิน",
    summary: "ตรวจสอบความเดือดร้อนหรือความไม่เป็นธรรมจากการใช้อำนาจรัฐ",
    canDo: "รับเรื่องและตรวจสอบการกระทำหรือการละเลยของหน่วยงานหรือเจ้าหน้าที่รัฐ รวมถึงเสนอแนะแนวทางแก้ไข",
    cannotDo: "ไม่ใช่หน่วยงานต้นสังกัดที่แก้บริการแทนโดยตรง และมีเรื่องบางประเภทที่กฎหมายไม่ให้อยู่ในอำนาจพิจารณา",
    complaintTypes: ["state-action"],
    channels: [
      { type: "phone", label: "โทร 1676", href: "tel:1676", detail: "โทรฟรีทั่วประเทศ" },
      { type: "website", label: "ดูช่องทางร้องเรียนของผู้ตรวจการแผ่นดิน", href: "https://www.ombudsman.go.th/" },
    ],
    source: { label: "สำนักงานผู้ตรวจการแผ่นดิน", url: "https://web.ombudsman.go.th/organization/about/ombudsman" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "nhrc",
    name: "สำนักงานคณะกรรมการสิทธิมนุษยชนแห่งชาติ",
    summary: "รับเรื่องที่อาจมีการละเมิดสิทธิมนุษยชนหรือการเลือกปฏิบัติที่ไม่เป็นธรรม",
    canDo: "รับคำปรึกษา รับเรื่องร้องเรียน ตรวจสอบตามหน้าที่และอำนาจ และเสนอแนะมาตรการแก้ไขหรือป้องกัน",
    cannotDo: "ไม่ใช่ศาลและไม่ตัดสินชดใช้ค่าเสียหาย เรื่องที่อยู่ในศาลหรือพ้นอำนาจอาจรับตรวจสอบไม่ได้ตามเงื่อนไข",
    complaintTypes: ["human-rights", "state-action"],
    channels: [
      { type: "phone", label: "โทร 1377", href: "tel:1377", detail: "เวลาราชการ" },
      { type: "website", label: "ร้องเรียนออนไลน์", href: "https://complaints.nhrc.or.th/" },
    ],
    source: { label: "คำแนะนำการร้องเรียน สำนักงาน กสม.", url: "https://www.nhrc.or.th/th/recommend-complaint" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "government-1111",
    name: "ศูนย์รับเรื่องราวร้องทุกข์ของรัฐบาล 1111",
    summary: "ช่องทางกลางสำหรับร้องทุกข์ แจ้งเบาะแส และส่งต่อเรื่องที่เกี่ยวข้องกับภาครัฐ",
    canDo: "รับเรื่อง ส่งต่อหน่วยงานที่เกี่ยวข้อง แจ้งรหัสเรื่อง และรองรับการติดตามสถานะ",
    cannotDo: "ไม่ได้ตรวจสอบสิทธิเฉพาะทางทุกเรื่องเอง และผลแก้ไขขึ้นอยู่กับหน่วยงานที่รับส่งต่อ",
    complaintTypes: ["state-action", "general"],
    channels: [
      { type: "phone", label: "โทร 1111", href: "tel:1111" },
      { type: "website", label: "ยื่นและติดตามเรื่อง", href: "https://1111.go.th/web2" },
    ],
    source: { label: "ศูนย์รับเรื่องราวร้องทุกข์ของรัฐบาล 1111", url: "https://1111.go.th/web2" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "damrongdham",
    name: "ศูนย์ดำรงธรรม",
    summary: "รับเรื่องร้องเรียนร้องทุกข์และประสานปัญหาในจังหวัดหรือพื้นที่",
    canDo: "รับเรื่อง คัดกรอง และประสานหน่วยงานจังหวัด อำเภอ หรือท้องถิ่นที่เกี่ยวข้อง",
    cannotDo: "ไม่ทดแทนหน่วยงานฉุกเฉิน ศาล หรือกลไกเฉพาะเรื่อง และอาจต้องส่งต่อหน่วยงานเจ้าของอำนาจ",
    complaintTypes: ["local-problem", "state-action", "general"],
    channels: [
      { type: "phone", label: "โทร 1567", href: "tel:1567" },
      { type: "website", label: "เว็บไซต์ศูนย์ดำรงธรรม", href: "https://damrongdham.moi.go.th/" },
    ],
    source: { label: "กระทรวงมหาดไทย — ศูนย์ดำรงธรรมและสายด่วน 1567", url: "https://moi.go.th/moi/" },
    lastVerifiedAt: verifiedAt,
  },
  {
    id: "moj",
    name: "ศูนย์บริการร่วม กระทรวงยุติธรรม",
    summary: "ให้ข้อมูล คำปรึกษา และช่วยประสานบริการในสังกัดกระทรวงยุติธรรม",
    canDo: "ช่วยคัดกรองปัญหากฎหมาย สิทธิ ความช่วยเหลือทางกฎหมาย และหน่วยงานในกระบวนการยุติธรรมที่เกี่ยวข้อง",
    cannotDo: "ไม่ให้คำพิพากษา ไม่รับรองผลคดี และเรื่องเฉพาะอาจต้องส่งต่อทนาย กองทุนยุติธรรม หรือหน่วยงานอื่น",
    complaintTypes: ["general", "human-rights", "state-action"],
    channels: [
      { type: "phone", label: "โทร 1111 กด 77", href: "tel:1111", detail: "เมื่อเชื่อมต่อแล้วกด 77" },
      { type: "website", label: "เว็บไซต์กระทรวงยุติธรรม", href: "https://www.moj.go.th/" },
    ],
    source: { label: "ช่องทางติดต่อหน่วยงานในสังกัดกระทรวงยุติธรรม", url: "https://www.moj.go.th/view/54891" },
    lastVerifiedAt: verifiedAt,
  },
];

const evidenceKeywords = ["หลักฐาน", "ภาพ", "วิดีโอ", "ข้อความ", "แชต", "หนังสือ", "พยาน", "สลิป", "ใบเสร็จ", "สัญญา"];
const safetyKeywords = ["ขู่", "ข่มขู่", "ทำร้าย", "คุกคาม", "ตาม", "กลัว", "อาวุธ", "ตอบโต้", "ความปลอดภัย"];
const retaliationKeywords = ["นายจ้าง", "หัวหน้า", "ที่ทำงาน", "เจ้าหน้าที่", "ผู้มีอิทธิพล", "ชุมชน", "เพื่อนบ้าน", "ตอบโต้", "กลั่นแกล้ง"];
const timeKeywords = ["อายุความ", "กำหนดเวลา", "วันนัด", "ศาล", "อุทธรณ์", "ภายใน", "ครบกำหนด", "หมายเรียก"];
const privacyKeywords = ["ปกปิด", "เปิดเผยชื่อ", "ข้อมูลส่วนบุคคล", "ข้อมูลส่วนตัว", "ที่อยู่", "เด็ก", "ผู้ป่วย", "สุขภาพ", "รูป", "คลิป"];

function hasAffirmedKeyword(context: string, keyword: string) {
  let searchFrom = 0;

  while (searchFrom < context.length) {
    const keywordIndex = context.indexOf(keyword, searchFrom);
    if (keywordIndex < 0) return false;
    const prefix = context.slice(Math.max(0, keywordIndex - 55), keywordIndex);
    const isNegated = /(?:ไม่มี|ยังไม่มี|ไม่เคยมี|ไม่ได้มี|ไม่กังวล|ไม่มีความกังวล|ไม่ต้องการ)[^.!?\n]{0,55}$/u.test(prefix);
    if (!isNegated) return true;
    searchFrom = keywordIndex + keyword.length;
  }

  return false;
}

export function matchComplaintTypes(context: string): ComplaintTypeMatch[] {
  const normalized = context.toLocaleLowerCase("th-TH");
  const matched = complaintTypeRules
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) => hasAffirmedKeyword(normalized, keyword.toLocaleLowerCase("th-TH")));
      const matchedStrongKeywords = rule.strongKeywords.filter((keyword) => hasAffirmedKeyword(normalized, keyword.toLocaleLowerCase("th-TH")));
      return { id: rule.id, label: rule.label, matchedKeywords, strongCount: matchedStrongKeywords.length };
    })
    .filter((match) => match.strongCount > 0)
    .sort((left, right) => (right.strongCount * 4 + right.matchedKeywords.length) - (left.strongCount * 4 + left.matchedKeywords.length))
    .map(({ id, label, matchedKeywords }) => ({ id, label, matchedKeywords }));

  return matched.length > 0
    ? matched
    : [{ id: "general", label: "ยังต้องให้เจ้าหน้าที่ช่วยคัดกรอง", matchedKeywords: [] }];
}

export function suggestAgencies(context: string, selectedOptions: ActionOptionId[] = [], limit = 3): SuggestedAgency[] {
  const typeMatches = matchComplaintTypes(context);
  const matchedTypeIds = new Set(typeMatches.map((match) => match.id));
  const wantsAdvice = selectedOptions.includes("seek-advice") || selectedOptions.includes("safety-support");
  const candidates = agencyCatalog
    .map((agency) => {
      const agencyMatches = agency.complaintTypes.filter((type) => matchedTypeIds.has(type));
      let score = agencyMatches.reduce((total, type) => {
        const match = typeMatches.find((item) => item.id === type);
        return total + 10 + (match?.matchedKeywords.length ?? 0) * 3;
      }, 0);

      if (agency.id === "moj" && wantsAdvice) score += 9;
      if (agency.id === "pcd" && matchedTypeIds.has("environment")) score += 30;
      if (agency.id === "dlpw" && matchedTypeIds.has("labour")) score += 36;
      if (agency.id === "ocpb" && matchedTypeIds.has("consumer")) score += 30;
      if (agency.id === "pdpc" && matchedTypeIds.has("privacy-digital")) score += 30;
      if (agency.id === "ccib" && matchedTypeIds.has("fraud-cyber")) score += 30;
      if (agency.id === "oic" && matchedTypeIds.has("official-information")) score += 40;
      if (agency.id === "ombudsman" && matchedTypeIds.has("state-action")) score += 12;
      if (agency.id === "nhrc" && matchedTypeIds.has("human-rights")) score += 12;
      if (agency.id === "government-1111" && matchedTypeIds.has("state-action")) score += 4;
      if (agency.id === "damrongdham" && matchedTypeIds.has("local-problem")) score += 8;
      return { agency, agencyMatches, score };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  const fallback = wantsAdvice
    ? [agencyCatalog.find((agency) => agency.id === "moj")]
    : [agencyCatalog.find((agency) => agency.id === "government-1111"), agencyCatalog.find((agency) => agency.id === "moj")];
  const selected = candidates.length > 0
    ? candidates
    : fallback.filter((agency): agency is AgencyGuidance => Boolean(agency)).map((agency) => ({ agency, agencyMatches: ["general" as const], score: 1 }));

  return selected.map(({ agency, agencyMatches }, index) => {
    const matchingDetails = agencyMatches
      .map((type) => typeMatches.find((match) => match.id === type))
      .filter((match): match is ComplaintTypeMatch => Boolean(match));
    const labels = matchingDetails.map((match) => match.label);
    const evidencePhrases = Array.from(new Set(matchingDetails.flatMap((match) => match.matchedKeywords))).slice(0, 4);

    return {
      ...agency,
      matchedComplaintTypes: agencyMatches,
      rank: index === 0 ? "หลัก" : index === 1 ? "สนับสนุน" : "ทางเลือก",
      reason: labels.length > 0
        ? `ตรงกับ${labels.join(" และ ")}${evidencePhrases.length > 0 ? ` จากข้อเท็จจริง “${evidencePhrases.join("”, “")}”` : ""}`
        : "เป็นช่องทางให้เจ้าหน้าที่ช่วยคัดกรองและส่งต่อเมื่อยังระบุหน่วยงานเฉพาะไม่ได้",
    };
  });
}

export function assessRisks(context: string, agency: SuggestedAgency | null): RiskAssessment[] {
  const normalized = context.toLocaleLowerCase("th-TH");
  const hasSafetyConcern = safetyKeywords.some((keyword) => hasAffirmedKeyword(normalized, keyword));
  const hasPrivacyConcern = privacyKeywords.some((keyword) => hasAffirmedKeyword(normalized, keyword));
  const hasRetaliationConcern = retaliationKeywords.some((keyword) => hasAffirmedKeyword(normalized, keyword));
  const hasTimeConcern = timeKeywords.some((keyword) => hasAffirmedKeyword(normalized, keyword));
  const hasEvidence = evidenceKeywords.some((keyword) => hasAffirmedKeyword(normalized, keyword));
  const generalSource = agency?.source ?? agencyCatalog.find((item) => item.id === "nhrc")!.source;

  return [
    {
      id: "safety",
      title: "ความปลอดภัยต่อชีวิตและร่างกาย",
      severity: hasSafetyConcern ? "seek_help_first" : "low",
      explanation: hasSafetyConcern ? "เรื่องที่เล่ามีถ้อยคำเกี่ยวกับการข่มขู่ คุกคาม การตอบโต้ หรือความไม่ปลอดภัย" : "ยังไม่พบถ้อยคำที่บ่งชี้อันตรายเร่งด่วน แต่ควรประเมินอีกครั้งหากสถานการณ์เปลี่ยน",
      mitigation: hasSafetyConcern ? "อย่าเผชิญผู้ก่อเหตุลำพัง ใช้ช่องทางติดต่อที่ปลอดภัย และขอเจ้าหน้าที่ช่วยวางแผนก่อนเปิดเผยตัวตน" : "เก็บหมายเลขฉุกเฉินและบอกคนที่ไว้ใจว่ากำลังดำเนินการเรื่องนี้",
      source: { label: "สำนักงานตำรวจแห่งชาติ — ช่องทางเหตุฉุกเฉิน", url: "https://royalthaipolice.go.th/faq.php" },
      lastVerifiedAt: verifiedAt,
    },
    {
      id: "privacy",
      title: "การเปิดเผยข้อมูลส่วนบุคคล",
      severity: hasPrivacyConcern ? "caution" : "low",
      explanation: hasPrivacyConcern ? "เรื่องอาจมีข้อมูลที่ระบุตัวบุคคล ภาพ ข้อมูลสุขภาพ หรือความต้องการปกปิดชื่อ" : "การยื่นเรื่องยังอาจต้องใช้ชื่อและช่องทางติดต่อ แม้เรื่องเล่าไม่พบข้อมูลอ่อนไหวชัดเจน",
      mitigation: "ใส่เฉพาะข้อมูลที่จำเป็น ปิดเลขบัตร เลขบัญชี ที่อยู่เต็ม และข้อมูลบุคคลอื่น พร้อมถามหน่วยงานว่าขอสงวนข้อมูลใดได้บ้าง",
      source: { label: "สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล", url: "https://complaint.pdpc.or.th/" },
      lastVerifiedAt: verifiedAt,
    },
    {
      id: "retaliation",
      title: "การตอบโต้และผลต่อความสัมพันธ์",
      severity: hasRetaliationConcern ? "caution" : "low",
      explanation: hasRetaliationConcern ? "เรื่องเกี่ยวข้องกับที่ทำงาน เจ้าหน้าที่ ผู้มีอิทธิพล หรือคนในชุมชน จึงควรคิดถึงผลหลังอีกฝ่ายทราบเรื่อง" : "ยังไม่พบความสัมพันธ์ที่เสี่ยงต่อการตอบโต้ชัดเจน แต่ผลจริงขึ้นอยู่กับผู้ถูกร้องและบริบท",
      mitigation: "เลือกผู้ติดต่อที่ไว้ใจ เก็บบันทึกการข่มขู่หรือกลั่นแกล้ง และขอคำปรึกษาก่อนหากอีกฝ่ายมีอำนาจเหนือกว่า",
      source: generalSource,
      lastVerifiedAt: verifiedAt,
    },
    {
      id: "allegation",
      title: "ถ้อยคำกล่าวหาและข้อเท็จจริง",
      severity: "caution",
      explanation: "หนังสือควรแยกสิ่งที่พบเห็นเอง เอกสารที่มี สิ่งที่ผู้อื่นเล่า และข้อสงสัยออกจากกัน",
      mitigation: "ใช้ถ้อยคำว่า “จากข้อมูลที่ข้าพเจ้าทราบ” หรือ “ขอให้ตรวจสอบ” และหลีกเลี่ยงการสรุปความผิดแทนหน่วยงาน",
      source: { label: "คำแนะนำการร้องเรียน สำนักงาน กสม.", url: "https://www.nhrc.or.th/th/recommend-complaint" },
      lastVerifiedAt: verifiedAt,
    },
    {
      id: "time",
      title: "กำหนดเวลาและกระบวนการคู่ขนาน",
      severity: hasTimeConcern ? "seek_help_first" : "caution",
      explanation: hasTimeConcern ? "เรื่องมีถ้อยคำเกี่ยวกับศาล วันนัด อายุความ หรือกำหนดเวลาที่ไม่ควรรอ" : "เรื่องบางประเภทมีกำหนดเวลาตามกฎหมาย แม้ข้อมูลที่เล่ายังไม่ระบุวันครบกำหนด",
      mitigation: "จดวันเกิดเหตุ วันได้รับหนังสือ วันนัด และขอผู้เชี่ยวชาญตรวจทันทีหากมีศาล อุทธรณ์ หรือกำหนดเวลาระบุไว้",
      source: { label: "ศูนย์บริการร่วม กระทรวงยุติธรรม", url: "https://www.moj.go.th/view/54891" },
      lastVerifiedAt: verifiedAt,
    },
    {
      id: "evidence",
      title: "พยานหลักฐาน",
      severity: hasEvidence ? "low" : "caution",
      explanation: hasEvidence ? "เรื่องระบุว่ามีหลักฐานบางส่วน จึงควรจัดเป็นบัญชีและเก็บต้นฉบับไว้" : "ยังไม่พบรายการหลักฐานชัดเจน ซึ่งอาจทำให้หน่วยงานต้องถามข้อมูลเพิ่ม",
      mitigation: "เก็บต้นฉบับ ทำสำเนา บันทึกวันเวลาและแหล่งที่มา และอย่าได้มาซึ่งหลักฐานด้วยวิธีที่ทำให้ตนเองไม่ปลอดภัย",
      source: generalSource,
      lastVerifiedAt: verifiedAt,
    },
  ];
}

export function getAgencyById(agencies: SuggestedAgency[], agencyId: string | null) {
  return agencies.find((agency) => agency.id === agencyId) ?? null;
}

export function buildEvidenceChecklist(context: string, complaintTypes: ComplaintTypeMatch[]) {
  const normalized = context.toLocaleLowerCase("th-TH");
  const items = [
    "สรุปลำดับเหตุการณ์พร้อมวัน เวลา และสถานที่",
    "สำเนาหลักฐานการติดต่อหรือเลขรับเรื่องครั้งก่อน",
    "เอกสาร ภาพ ข้อความ หรือพยานที่สนับสนุนข้อเท็จจริง",
    "หลักฐานผลกระทบหรือความเสียหาย โดยปิดข้อมูลที่ไม่จำเป็น",
  ];

  if (complaintTypes.some((type) => type.id === "consumer")) items.push("ใบเสร็จ สัญญา โฆษณา และการสนทนากับผู้ขาย");
  if (complaintTypes.some((type) => type.id === "labour")) items.push("สัญญาจ้าง สลิปค่าจ้าง ตารางทำงาน และหนังสือเลิกจ้าง (ถ้ามี)");
  if (complaintTypes.some((type) => type.id === "environment")) items.push("จุดเกิดเหตุ แหล่งกำเนิด ช่วงเวลา ภาพผลกระทบ และข้อมูลผู้ได้รับผลกระทบ");
  if (complaintTypes.some((type) => type.id === "privacy-digital" || type.id === "fraud-cyber")) items.push("ภาพหน้าจอ URL วันเวลา ชื่อบัญชี และหลักฐานธุรกรรม โดยปิดรหัสผ่านและเลขบัญชีส่วนเกิน");
  if (!evidenceKeywords.some((keyword) => normalized.includes(keyword))) items.unshift("เริ่มจากจดสิ่งที่จำได้ก่อน แม้ยังไม่มีเอกสารก็ขอคำปรึกษาได้");

  return Array.from(new Set(items));
}
