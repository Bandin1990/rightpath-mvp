export type EmergencyContactId = string;

export type EmergencyChannel = {
  label: string;
  detail?: string;
  href?: string;
  urgent?: boolean;
};

export type EmergencyContact = {
  id: EmergencyContactId;
  name: string;
  helpsWith: string;
  channels: EmergencyChannel[];
  sourceLabel: string;
  sourceUrl: string;
};

export type UrgentThreat = {
  id: string;
  label: string;
  detail: string;
  contactIds: EmergencyContactId[];
};

export type UrgentThreatGroup = {
  id: string;
  title: string;
  description: string;
  threats: UrgentThreat[];
};

export type EmergencyCatalog = {
  contacts: EmergencyContact[];
  threatGroups: UrgentThreatGroup[];
  keywords: Record<string, string[]>;
  checkedAt: string;
};

export const emergencyContacts: EmergencyContact[] = [
  {
    id: "police",
    name: "ตำรวจ — เหตุด่วนเหตุร้าย",
    helpsWith: "อันตรายจากบุคคล การขู่ฆ่า อาวุธ การทำร้าย กักขัง ลักพาตัว บุกรุก หรืออาชญากรรมที่กำลังเกิดขึ้น",
    channels: [{ label: "โทร 191", href: "tel:191", urgent: true }],
    sourceLabel: "สำนักงานตำรวจแห่งชาติ",
    sourceUrl: "https://royalthaipolice.go.th/faq.php",
  },
  {
    id: "ems",
    name: "การแพทย์ฉุกเฉิน",
    helpsWith: "หมดสติ หายใจลำบาก บาดเจ็บรุนแรง เลือดออกมาก ถูกพิษ ใช้ยาเกินขนาด หรือมีภาวะคุกคามต่อชีวิต",
    channels: [{ label: "โทร 1669", href: "tel:1669", urgent: true }],
    sourceLabel: "สถาบันการแพทย์ฉุกเฉินแห่งชาติ",
    sourceUrl: "https://www.niems.go.th/1/News/Detail/7452?group=3",
  },
  {
    id: "social",
    name: "ศูนย์ช่วยเหลือสังคม",
    helpsWith: "ความรุนแรงในครอบครัว เด็ก ผู้สูงอายุ คนพิการ ผู้ถูกแสวงหาประโยชน์ ผู้เสียหายจากการค้ามนุษย์ หรือผู้ไม่มีที่ปลอดภัย",
    channels: [{ label: "โทร 1300", href: "tel:1300", detail: "ตลอด 24 ชั่วโมง", urgent: true }],
    sourceLabel: "กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์",
    sourceUrl: "https://www.m-society.go.th/ewtadmin/ewt/mso_web/download/article/article_20211110151901.pdf",
  },
  {
    id: "mental",
    name: "สายด่วนสุขภาพจิต",
    helpsWith: "ความคิดทำร้ายตนเอง วิกฤตทางใจ ความกลัวรุนแรง หรือจำเป็นต้องมีผู้เชี่ยวชาญรับฟังทันที หากกำลังลงมือหรือมีอันตรายต่อชีวิตให้โทร 1669 หรือ 191 ก่อน",
    channels: [{ label: "โทร 1323", href: "tel:1323", detail: "ฟรี ตลอด 24 ชั่วโมง", urgent: true }],
    sourceLabel: "กรมสุขภาพจิต",
    sourceUrl: "https://dmh.go.th/main.asp",
  },
  {
    id: "disaster",
    name: "สายด่วนนิรภัย",
    helpsWith: "ไฟไหม้ อุทกภัย วาตภัย ไฟป่า ดินถล่ม อาคารถล่ม ภัยสารเคมี วัตถุอันตราย และสาธารณภัยอื่น",
    channels: [{ label: "โทร 1784", href: "tel:1784", detail: "ตลอด 24 ชั่วโมง", urgent: true }],
    sourceLabel: "กรมป้องกันและบรรเทาสาธารณภัย",
    sourceUrl: "https://www.disaster.go.th/weblink/23",
  },
  {
    id: "bank",
    name: "ธนาคารหรือผู้ให้บริการทางการเงินของคุณ",
    helpsWith: "ขอระงับธุรกรรม ปิดบัตร ล็อกโมบายแบงก์กิ้ง หรือระงับบัญชีเมื่อเงินกำลังถูกโอนออกหรือข้อมูลทางการเงินถูกยึด",
    channels: [{ label: "โทรสายด่วนฉุกเฉินของธนาคาร", detail: "ใช้หมายเลขจากแอป เว็บไซต์ทางการ หรือหลังบัตรเท่านั้น", urgent: true }],
    sourceLabel: "ธนาคารแห่งประเทศไทย",
    sourceUrl: "https://www.bot.or.th/content/dam/bot/satang-stories/l1/L1%20070825.pdf",
  },
  {
    id: "aoc",
    name: "ศูนย์ AOC — อาชญากรรมออนไลน์",
    helpsWith: "ถูกหลอกโอนเงิน เงินออกจากบัญชี แอปดูดเงิน บัญชีม้า หรือภัยการเงินออนไลน์ที่ต้องรีบประสานระงับบัญชี",
    channels: [{ label: "โทร 1441", href: "tel:1441", detail: "ช่องทางโทรศัพท์ทางการ ตลอด 24 ชั่วโมง", urgent: true }],
    sourceLabel: "กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม",
    sourceUrl: "https://mdes.go.th/mission/153/",
  },
  {
    id: "cyber-police",
    name: "ตำรวจไซเบอร์",
    helpsWith: "แจ้งความอาชญากรรมทางเทคโนโลยี การยึดบัญชี การปลอมตัว ข่มขู่ หรือเผยแพร่ข้อมูลเพื่อก่อความเสียหาย",
    channels: [{ label: "แจ้งความออนไลน์", href: "https://www.thaipoliceonline.go.th/" }],
    sourceLabel: "กองบัญชาการตำรวจสืบสวนสอบสวนอาชญากรรมทางเทคโนโลยี",
    sourceUrl: "https://ccid4.ccib.go.th/",
  },
  {
    id: "etda",
    name: "1212 ETDA — ปัญหาออนไลน์",
    helpsWith: "ขอคำแนะนำและประสานปัญหาซื้อขายออนไลน์ บัญชีโซเชียลถูกแฮก บัญชีปลอม หรือเนื้อหาออนไลน์ที่สร้างความเสียหาย",
    channels: [
      { label: "โทร 1212", href: "tel:1212", detail: "ตลอด 24 ชั่วโมง" },
      { label: "แจ้งปัญหาออนไลน์", href: "https://1212.etda.or.th/" },
    ],
    sourceLabel: "ศูนย์ช่วยเหลือและจัดการปัญหาออนไลน์ 1212ETDA",
    sourceUrl: "https://1212.etda.or.th/",
  },
  {
    id: "thai-cert",
    name: "ThaiCERT — ประสานภัยไซเบอร์",
    helpsWith: "เว็บไซต์ปลอม แอปต้องสงสัย บัญชีโซเชียลหลอกลวง มัลแวร์ หรือเหตุไซเบอร์ที่ต้องตรวจสอบและประสานระงับ",
    channels: [
      { label: "โทร 02-114-3531", href: "tel:021143531", detail: "ตลอด 24 ชั่วโมง" },
      { label: "อีเมล thaicert@ncsa.or.th", href: "mailto:thaicert@ncsa.or.th" },
    ],
    sourceLabel: "ศูนย์ประสานการรักษาความมั่นคงปลอดภัยระบบคอมพิวเตอร์แห่งชาติ",
    sourceUrl: "https://www.thaicert.or.th/support-coordination/",
  },
  {
    id: "pdpc",
    name: "สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล",
    helpsWith: "ร้องเรียนกรณีองค์กรหรือผู้ควบคุมข้อมูลเก็บ ใช้ เปิดเผย หรือไม่คุ้มครองข้อมูลส่วนบุคคลโดยไม่ชอบ การยื่นเรื่องนี้เป็นขั้นติดตาม ไม่ทดแทน 191 หรือ 1441 ในเหตุเร่งด่วน",
    channels: [{ label: "ยื่นคำร้องเรียนออนไลน์", href: "https://complaint.pdpc.or.th/" }],
    sourceLabel: "สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล",
    sourceUrl: "https://complaint.pdpc.or.th/",
  },
];

export const urgentThreatGroups: UrgentThreatGroup[] = [
  {
    id: "life-violence",
    title: "ภัยต่อชีวิต ร่างกาย และเสรีภาพ",
    description: "กรณีที่บุคคลอาจได้รับอันตราย ถูกควบคุม หรือไม่มีพื้นที่ปลอดภัย",
    threats: [
      {
        id: "death-threat-weapon",
        label: "ถูกขู่ฆ่า ขู่ทำร้าย ผู้คุกคามอยู่ใกล้ หรือมีอาวุธ",
        detail: "รวมการตามประกบ เฝ้ารอหน้าบ้าน/ที่ทำงาน และการส่งข้อความขู่ที่น่าเชื่อว่าจะลงมือ",
        contactIds: ["police"],
      },
      {
        id: "assault-confinement-kidnap",
        label: "กำลังถูกทำร้าย กักขัง ลักพาตัว บุกรุก หรือถูกบังคับให้ไปกับผู้อื่น",
        detail: "รวมผู้พบเห็นเหตุหรือทราบตำแหน่งผู้ประสบภัย",
        contactIds: ["police", "ems"],
      },
      {
        id: "domestic-sexual-violence",
        label: "ความรุนแรงในครอบครัว การล่วงละเมิดทางเพศ หรือการคุกคามที่กำลังเกิดขึ้น",
        detail: "หากบาดเจ็บหรือต้องการรักษาเร่งด่วน ให้ติดต่อการแพทย์ฉุกเฉินด้วย",
        contactIds: ["police", "ems", "social"],
      },
      {
        id: "missing-at-risk",
        label: "เด็กหรือบุคคลเปราะบางหาย ถูกพาตัว หรือขาดการติดต่อในสถานการณ์เสี่ยง",
        detail: "ไม่ต้องรอให้ครบ 24 ชั่วโมงหากมีเหตุเชื่อว่าอยู่ในอันตราย",
        contactIds: ["police", "social"],
      },
      {
        id: "vulnerable-person-danger",
        label: "เด็ก ผู้สูงอายุ คนพิการ หรือผู้พึ่งพิงกำลังถูกทำร้าย ทอดทิ้ง หรือไม่มีที่ปลอดภัย",
        detail: "รวมการขาดอาหาร ยา ที่พัก หรือผู้ดูแลจนเกิดอันตราย",
        contactIds: ["social", "police", "ems"],
      },
      {
        id: "trafficking-forced-labor",
        label: "ถูกค้ามนุษย์ บังคับค้าประเวณี บังคับใช้แรงงาน ยึดเอกสาร หรือควบคุมการเดินทาง",
        detail: "รวมการถูกขู่ไม่ให้หนีหรือถูกกักไว้เพื่อแสวงหาประโยชน์",
        contactIds: ["social", "police"],
      },
      {
        id: "unrest-suspicious-object",
        label: "พบวัตถุต้องสงสัย เหตุรุนแรง ความไม่สงบ หรือภัยที่อาจกระทบคนจำนวนมาก",
        detail: "อย่าเข้าใกล้หรือแตะต้องวัตถุ และออกจากบริเวณเสี่ยงก่อน",
        contactIds: ["police", "disaster"],
      },
    ],
  },
  {
    id: "medical-mental",
    title: "การแพทย์และสุขภาพจิตฉุกเฉิน",
    description: "อาการที่รอไม่ได้หรือมีความเสี่ยงเสียชีวิต พิการ หรือทำร้ายตนเอง",
    threats: [
      {
        id: "unconscious-breathing-stroke",
        label: "หมดสติ ไม่หายใจ หายใจลำบาก เจ็บหน้าอกรุนแรง ชัก หรือสงสัยโรคหลอดเลือดสมอง",
        detail: "ให้แจ้งตำแหน่งและอาการกับเจ้าหน้าที่อย่างชัดเจน",
        contactIds: ["ems"],
      },
      {
        id: "severe-injury-bleeding",
        label: "บาดเจ็บรุนแรง เลือดออกมาก ถูกยิง ถูกแทง ไฟไหม้ หรืออวัยวะขาด",
        detail: "โทรขอทีมแพทย์และทำตามคำแนะนำของเจ้าหน้าที่ระหว่างรอ",
        contactIds: ["ems", "police"],
      },
      {
        id: "poison-overdose",
        label: "ได้รับสารพิษ สารเคมี ยาเกินขนาด หรือไม่ทราบสิ่งที่รับเข้าสู่ร่างกาย",
        detail: "เก็บฉลากหรือภาชนะไว้ให้เจ้าหน้าที่ดู แต่ไม่ทำให้อาเจียนเองหากไม่ได้รับคำแนะนำ",
        contactIds: ["ems"],
      },
      {
        id: "self-harm-suicide",
        label: "กำลังคิด วางแผน หรือลงมือทำร้ายตนเอง หรือมีบุคคลเสี่ยงฆ่าตัวตาย",
        detail: "อย่าอยู่ลำพัง หากกำลังลงมือให้ติดต่อ 1669 หรือ 191 ก่อนสายปรึกษา",
        contactIds: ["ems", "police", "mental"],
      },
      {
        id: "pregnancy-emergency",
        label: "ตั้งครรภ์หรือคลอดฉุกเฉิน มีเลือดออกมาก ปวดรุนแรง หรือแม่/ทารกมีอาการผิดปกติ",
        detail: "ให้เจ้าหน้าที่การแพทย์ประเมินและจัดทีมช่วยเหลือ",
        contactIds: ["ems"],
      },
    ],
  },
  {
    id: "property-finance",
    title: "ทรัพย์สินและการเงินที่กำลังเสียหาย",
    description: "เหตุที่ต้องหยุดการสูญเสีย รักษาความปลอดภัย และเก็บหลักฐานทันที",
    threats: [
      {
        id: "robbery-theft-in-progress",
        label: "กำลังถูกปล้น ชิงทรัพย์ ขโมยรถ บุกรุกบ้าน หรือผู้ก่อเหตุยังอยู่ใกล้",
        detail: "หลีกเลี่ยงการเผชิญหน้าและไปยังจุดปลอดภัยก่อน",
        contactIds: ["police"],
      },
      {
        id: "scam-transfer",
        label: "เพิ่งถูกหลอกให้โอนเงิน ซื้อสินค้า ลงทุน กู้เงิน หรือจ่ายค่าไถ่ออนไลน์",
        detail: "รีบติดต่อ 1441 หรือธนาคารทันที เพราะเวลามีผลต่อโอกาสระงับธุรกรรม",
        contactIds: ["aoc", "bank", "cyber-police"],
      },
      {
        id: "unauthorized-transaction",
        label: "มีเงินถูกโอน ตัดบัตร ถอน หรือใช้กระเป๋าเงินดิจิทัลโดยไม่ได้อนุญาต",
        detail: "ล็อกช่องทางการเงินและขอระงับธุรกรรมก่อนรวบรวมหลักฐานเพิ่มเติม",
        contactIds: ["bank", "aoc", "cyber-police"],
      },
      {
        id: "banking-takeover",
        label: "โมบายแบงก์กิ้ง บัตร ซิม OTP รหัสผ่าน หรืออุปกรณ์ถูกยึดควบคุม",
        detail: "รวมการติดตั้งแอปควบคุมหน้าจอหรือแอปดูดเงินตามคำสั่งคนร้าย",
        contactIds: ["bank", "aoc", "cyber-police"],
      },
      {
        id: "extortion-ransom",
        label: "ถูกรีดไถ แบล็กเมล เรียกค่าไถ่ หรือขู่ให้โอนเงินภายในเวลาจำกัด",
        detail: "อย่าโอนเพิ่ม เก็บข้อความและหลักฐาน และแจ้งตำรวจ หากเป็นเหตุออนไลน์ให้แจ้งตำรวจไซเบอร์ด้วย",
        contactIds: ["police", "cyber-police", "aoc"],
      },
    ],
  },
  {
    id: "digital-data",
    title: "บัญชีดิจิทัล ข้อมูลส่วนบุคคล และชื่อเสียง",
    description: "ภัยที่อาจลุกลามรวดเร็วไปยังเงิน ตัวตน ความปลอดภัย หรือบุคคลอื่น",
    threats: [
      {
        id: "social-email-hacked",
        label: "บัญชีโซเชียล อีเมล คลาวด์ หรือแชตถูกแฮกและเข้าใช้งานไม่ได้",
        detail: "ใช้หน้ากู้คืนบัญชีทางการของแพลตฟอร์ม เปลี่ยนรหัสผ่านบัญชีที่เกี่ยวข้อง และตรวจอุปกรณ์ที่เข้าสู่ระบบ",
        contactIds: ["etda", "thai-cert", "cyber-police"],
      },
      {
        id: "impersonation-fake-account",
        label: "มีบัญชีปลอม สวมรอย หรือใช้ชื่อ/ภาพของคุณไปหลอกผู้อื่น",
        detail: "รายงานบัญชีกับแพลตฟอร์ม แจ้งคนใกล้ชิดไม่ให้โอนเงิน และเก็บ URL/ภาพหน้าจอ",
        contactIds: ["etda", "thai-cert", "cyber-police"],
      },
      {
        id: "malware-ransomware",
        label: "โทรศัพท์หรือคอมพิวเตอร์ถูกควบคุม ติดมัลแวร์ ถูกล็อกข้อมูล หรือเรียกค่าไถ่",
        detail: "ตัดการเชื่อมต่อเครือข่ายจากเครื่องที่สงสัย และอย่าใช้เครื่องนั้นทำธุรกรรมการเงิน",
        contactIds: ["thai-cert", "cyber-police", "bank"],
      },
      {
        id: "data-leak-doxxing",
        label: "เลขบัตร ที่อยู่ เบอร์โทร พิกัด ข้อมูลสุขภาพ หรือข้อมูลสำคัญถูกเผยแพร่/ส่งต่อ",
        detail: "หากข้อมูลทำให้ผู้คุกคามตามตัวได้ ให้ติดต่อ 191 ด้วย และขอให้แพลตฟอร์มระงับการเผยแพร่",
        contactIds: ["police", "etda", "cyber-police", "pdpc"],
      },
      {
        id: "forged-deepfake-harmful-content",
        label: "ถูกปลอมเอกสาร ปลอมภาพ/เสียง Deepfake หรือเผยแพร่ข้อมูลเท็จที่ก่อความเสียหายทันที",
        detail: "เก็บต้นฉบับ URL วันเวลา และภาพหน้าจอ ก่อนรายงานให้แพลตฟอร์มลบหรือจำกัดการเผยแพร่",
        contactIds: ["etda", "cyber-police", "thai-cert", "pdpc"],
      },
      {
        id: "intimate-image-child-content",
        label: "ภาพส่วนตัวหรือภาพทางเพศถูกขู่เผยแพร่ เผยแพร่โดยไม่ยินยอม หรือมีเนื้อหาล่วงละเมิดเด็ก",
        detail: "อย่าส่งเงินหรือส่งภาพเพิ่ม เก็บหลักฐานเท่าที่ปลอดภัย และขอความช่วยเหลือทันที",
        contactIds: ["police", "social", "cyber-police", "etda"],
      },
    ],
  },
  {
    id: "disaster-accident",
    title: "สาธารณภัย อุบัติเหตุ และสิ่งแวดล้อมอันตราย",
    description: "เหตุที่ต้องอพยพ กู้ภัย ปิดพื้นที่ หรือประสานหลายหน่วยงาน",
    threats: [
      {
        id: "fire-explosion-chemical",
        label: "ไฟไหม้ ระเบิด แก๊สรั่ว สารเคมีรั่ว หรือมีกลิ่น/ควันที่ทำให้หายใจลำบาก",
        detail: "ออกจากพื้นที่ตามทิศทางที่ปลอดภัย ไม่ย้อนกลับไปเก็บของ",
        contactIds: ["disaster", "ems", "police"],
      },
      {
        id: "building-electrical-collapse",
        label: "อาคารทรุด/ถล่ม ไฟฟ้ารั่ว สิ่งปลูกสร้างไม่มั่นคง หรือมีคนติดอยู่",
        detail: "กันคนออกจากจุดเสี่ยงและแจ้งตำแหน่งที่ชัดเจน",
        contactIds: ["disaster", "ems", "police"],
      },
      {
        id: "flood-storm-landslide-earthquake",
        label: "น้ำท่วมฉับพลัน พายุ ไฟป่า ดินถล่ม แผ่นดินไหว หรือจำเป็นต้องอพยพ",
        detail: "ติดตามคำสั่งทางการและอย่าฝืนเข้าเขตที่ถูกปิด",
        contactIds: ["disaster", "ems"],
      },
      {
        id: "transport-accident",
        label: "อุบัติเหตุทางถนน รถไฟ เรือ หรือการเดินทาง มีผู้บาดเจ็บหรือติดอยู่",
        detail: "ระบุตำแหน่ง จำนวนผู้บาดเจ็บ และอันตรายรอบจุดเกิดเหตุ",
        contactIds: ["ems", "police", "disaster"],
      },
      {
        id: "drowning-lost-trapped",
        label: "จมน้ำ สูญหาย ติดในรถ ลิฟต์ อาคาร ป่า หรือพื้นที่ที่ออกเองไม่ได้",
        detail: "แจ้งพิกัด จุดสังเกต และเวลาที่ติดต่อครั้งล่าสุด",
        contactIds: ["ems", "police", "disaster"],
      },
    ],
  },
];

// Used only when free text cannot be matched to a reviewed threat rule. Keep this
// intentionally narrow: 191 for immediate danger and 1300 for human triage.
export const fallbackEmergencyContactIds: EmergencyContactId[] = ["police", "social"];

export const emergencySourceCheckedAt = "1 สิงหาคม 2569";
