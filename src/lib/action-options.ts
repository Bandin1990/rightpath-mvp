export type ActionOptionId = "safety-support" | "preserve-evidence" | "seek-advice" | "contact-owner" | "formal-complaint";

export type ActionOption = {
  id: ActionOptionId;
  title: string;
  summary: string;
  suitableWhen: string;
  firstStep: string;
  benefit: string;
  limitation: string;
  possibleOutcome: string;
  effort: "น้อย" | "ปานกลาง" | "มาก";
  disclosure: "ต่ำ" | "ปานกลาง" | "สูง";
  recommendedReason?: string;
};

const safetyKeywords = ["ข่มขู่", "ทำร้าย", "คุกคาม", "ตอบโต้", "ความปลอดภัย", "กลัว", "เปิดเผยชื่อ", "ปกปิด"];
const evidenceKeywords = ["หลักฐาน", "ภาพ", "วิดีโอ", "ข้อความ", "แชต", "ใบเสร็จ", "หนังสือ", "พยาน", "สลิป"];
const stateKeywords = ["เจ้าหน้าที่", "หน่วยงาน", "เทศบาล", "อบต", "อำเภอ", "จังหวัด", "กรม", "กระทรวง", "ตำรวจ", "ราชการ"];

type SpecificIssue = "environment" | "labour" | "consumer" | "privacy" | "cyber" | "official-information" | "state" | "general";

const issueGuidance: Record<SpecificIssue, {
  label: string;
  directTitle: string;
  directSummary: string;
  directFirstStep: string;
  complaintTitle: string;
  complaintSummary: string;
  complaintFirstStep: string;
  evidenceFirstStep: string;
}> = {
  environment: {
    label: "ปัญหามลพิษหรือผลกระทบต่อสิ่งแวดล้อม",
    directTitle: "แจ้งแหล่งกำเนิดมลพิษและขอเลขรับเรื่อง",
    directSummary: "แจ้งจุดเกิดเหตุ แหล่งกำเนิด ช่วงเวลา และผลกระทบต่อกรมควบคุมมลพิษหรือหน่วยงานพื้นที่เพื่อให้ตรวจสอบ",
    directFirstStep: "ถ่ายภาพหรือจดพิกัดจากจุดปลอดภัย ระบุช่วงเวลาที่เกิดซ้ำ แล้วแจ้งผ่าน ECAP หรือโทร 1650",
    complaintTitle: "ยื่นหนังสือขอให้ตรวจแหล่งกำเนิดและแจ้งผล",
    complaintSummary: "ทำหนังสือระบุแหล่งกำเนิด ลักษณะมลพิษ ผู้ได้รับผลกระทบ การแจ้งครั้งก่อน และสิ่งที่ขอให้ตรวจ",
    complaintFirstStep: "แนบภาพ พิกัด ลำดับเหตุการณ์ เลขรับเดิม และขอให้แจ้งผลตรวจหรือมาตรการแก้ไขเป็นลายลักษณ์อักษร",
    evidenceFirstStep: "ทำตารางวัน เวลา กลิ่น สี เสียง หรืออาการที่พบ พร้อมภาพและพิกัดโดยไม่เข้าใกล้จุดอันตราย",
  },
  labour: {
    label: "ปัญหาค่าจ้างหรือการจ้างงาน",
    directTitle: "ทวงถามนายจ้างเป็นลายลักษณ์อักษร",
    directSummary: "แจ้งยอดหรือสิทธิที่ต้องการให้แก้ไข พร้อมขอคำตอบที่ตรวจสอบย้อนหลังได้ หากการติดต่อไม่เพิ่มความเสี่ยง",
    directFirstStep: "ระบุช่วงทำงาน ยอดที่ค้าง และหลักฐาน แล้วส่งข้อความหรือหนังสือถึงนายจ้างโดยเก็บสำเนา",
    complaintTitle: "ยื่นคำร้องต่อพนักงานตรวจแรงงาน",
    complaintSummary: "ใช้ข้อมูลการจ้าง งานที่ทำ ค่าจ้างหรือสิทธิที่ค้าง และหลักฐาน เพื่อขอให้พนักงานตรวจแรงงานตรวจข้อเท็จจริง",
    complaintFirstStep: "เตรียมสัญญาจ้าง สลิป ตารางทำงาน แชต และหนังสือเลิกจ้าง แล้วใช้ e-Service กรมสวัสดิการและคุ้มครองแรงงาน",
    evidenceFirstStep: "เรียงวันเริ่มงาน ตารางทำงาน วันที่จ่ายค่าจ้าง ยอดที่ได้รับ และยอดที่เห็นว่ายังค้าง",
  },
  consumer: {
    label: "ปัญหาจากสินค้า บริการ หรือสัญญา",
    directTitle: "แจ้งผู้ขายให้แก้ไขหรือคืนเงินเป็นลายลักษณ์อักษร",
    directSummary: "ระบุสิ่งที่ซื้อ สิ่งที่ไม่เป็นไปตามตกลง และทางแก้ที่ต้องการ พร้อมกำหนดช่องทางตอบกลับ",
    directFirstStep: "ส่งข้อความถึงผู้ขายพร้อมเลขคำสั่งซื้อ วันที่ชำระ ปัญหาที่พบ และคำขอ เช่น คืนเงิน เปลี่ยนสินค้า หรือแก้บริการ",
    complaintTitle: "ร้องทุกข์ผู้บริโภคพร้อมหลักฐานการซื้อ",
    complaintSummary: "ยื่นเรื่องผ่านระบบ สคบ. เมื่อคุยกับผู้ขายแล้วไม่สำเร็จ หรือข้อโฆษณาและสัญญาอาจไม่เป็นธรรม",
    complaintFirstStep: "รวมใบเสร็จ สัญญา โฆษณา แชต และคำตอบของผู้ขาย แล้วกรอกระบบร้องทุกข์ออนไลน์ สคบ.",
    evidenceFirstStep: "เก็บหน้าโฆษณา เงื่อนไขตอนซื้อ ใบเสร็จ ภาพสินค้า และบทสนทนากับผู้ขายไว้ในชุดเดียวกัน",
  },
  privacy: {
    label: "ปัญหาข้อมูลส่วนบุคคลหรือการเผยแพร่ข้อมูล",
    directTitle: "ขอให้ผู้ดูแลข้อมูลหยุดใช้ แก้ไข หรือลบข้อมูล",
    directSummary: "ติดต่อผู้ควบคุมข้อมูลหรือแพลตฟอร์มด้วยคำขอที่ชัดเจนก่อน หากปลอดภัยและทราบผู้รับผิดชอบ",
    directFirstStep: "ระบุข้อมูลที่ถูกใช้ URL วันเวลา และสิ่งที่ต้องการให้หยุด แก้ไข หรือลบ โดยไม่ส่งข้อมูลลับเพิ่ม",
    complaintTitle: "ร้องเรียนการใช้หรือเปิดเผยข้อมูลส่วนบุคคล",
    complaintSummary: "ยื่นต่อ สคส. เมื่อเป็นการเก็บ ใช้ หรือเปิดเผยข้อมูลโดยผู้ควบคุมข้อมูลและไม่ได้รับการแก้ไข",
    complaintFirstStep: "แนบคำขอที่เคยส่ง คำตอบ ภาพหน้าจอ URL และวันเวลา ผ่านระบบรับเรื่องร้องเรียนของ สคส.",
    evidenceFirstStep: "บันทึก URL ชื่อบัญชี วันเวลา ผู้เผยแพร่ และสำเนาคำขอลบ โดยปิดข้อมูลบุคคลอื่นที่ไม่จำเป็น",
  },
  cyber: {
    label: "อาชญากรรมออนไลน์หรือการหลอกโอนเงิน",
    directTitle: "ติดต่อธนาคารและหยุดความเสียหายก่อน",
    directSummary: "หากเงินยังเคลื่อนไหวหรือบัญชียังถูกยึดครอง ให้ติดต่อธนาคารและโทร 1441 ทันที ไม่ควรรอทำหนังสือ",
    directFirstStep: "หยุดติดต่อผู้ต้องสงสัย เปลี่ยนรหัสผ่านจากอุปกรณ์ปลอดภัย ติดต่อธนาคาร และโทร 1441",
    complaintTitle: "แจ้งความอาชญากรรมทางเทคโนโลยี",
    complaintSummary: "แจ้งความออนไลน์ด้วยลำดับเหตุการณ์ ช่องทางติดต่อผู้ก่อเหตุ ธุรกรรม และหลักฐานดิจิทัล",
    complaintFirstStep: "เก็บสลิป แชต URL ชื่อบัญชี และเวลา แล้วแจ้งผ่าน thaipoliceonline.go.th โดยไม่เปิดเผย OTP หรือรหัสผ่าน",
    evidenceFirstStep: "เก็บภาพหน้าจอแบบเห็น URL หรือชื่อบัญชีและเวลา พร้อมสลิปธุรกรรม แต่ปิดเลขบัญชีส่วนที่ไม่จำเป็น",
  },
  "official-information": {
    label: "ปัญหาการขอข้อมูลข่าวสารของราชการ",
    directTitle: "ทวงถามผลคำขอข้อมูลจากหน่วยงานเจ้าของข้อมูล",
    directSummary: "ขอหลักฐานวันที่รับคำขอ ชื่อผู้รับ และคำตอบเป็นลายลักษณ์อักษร เพื่อแยกว่าควรร้องเรียนหรืออุทธรณ์",
    directFirstStep: "ส่งสำเนาคำขอเดิมและขอให้หน่วยงานแจ้งว่ามีคำสั่งเปิดเผย ปฏิเสธ หรือยังอยู่ระหว่างพิจารณา",
    complaintTitle: "ร้องเรียนหรืออุทธรณ์ต่อ สขร. ตามคำตอบที่ได้รับ",
    complaintSummary: "ใช้ระบบดิจิทัลของ สขร. พร้อมคำขอเดิมและหนังสือปฏิเสธหรือหลักฐานว่าไม่ได้รับคำตอบ",
    complaintFirstStep: "แยกให้ชัดว่าไม่มีคำตอบหรือมีคำสั่งปฏิเสธ แล้วเลือกประเภทเรื่องในระบบ สขร. ให้ตรง",
    evidenceFirstStep: "เก็บคำขอข้อมูล หลักฐานวันยื่น หนังสือตอบหรือปฏิเสธ และบันทึกการติดตามทุกครั้ง",
  },
  state: {
    label: "การกระทำหรือการละเลยของหน่วยงานรัฐ",
    directTitle: "ยื่นเรื่องต่อหน่วยงานต้นสังกัดและขอเลขรับ",
    directSummary: "ขอให้หน่วยงานเจ้าของหน้าที่ตรวจและตอบเป็นลายลักษณ์อักษร เพื่อให้มีหลักฐานว่าขอแก้ไขแล้ว",
    directFirstStep: "ระบุหน่วยงาน ผู้รับผิดชอบ วันที่เคยติดต่อ สิ่งที่ยังไม่ดำเนินการ และขอเลขรับเรื่อง",
    complaintTitle: "ร้องเรียนการใช้อำนาจหรือการละเลยของรัฐ",
    complaintSummary: "ยื่นต่อกลไกตรวจสอบเมื่อหน่วยงานต้นเรื่องไม่แก้ไข ใช้อำนาจไม่เป็นธรรม หรือไม่ตอบเรื่องที่รับไว้",
    complaintFirstStep: "แนบหนังสือเดิม เลขรับ คำตอบ และผลกระทบ แล้วเลือกผู้ตรวจการแผ่นดิน กสม. หรือช่องทางกลางตามลักษณะเรื่อง",
    evidenceFirstStep: "เรียงวันที่ติดต่อ ชื่อหน่วยงาน เลขรับ คำตอบ และสิ่งที่ยังไม่ได้ดำเนินการเป็นตารางสั้น ๆ",
  },
  general: {
    label: "เรื่องที่ยังต้องคัดกรองเพิ่ม",
    directTitle: "ติดต่อผู้รับผิดชอบและขอหลักฐานรับเรื่อง",
    directSummary: "ขอให้ผู้ที่มีหน้าที่โดยตรงรับทราบข้อเท็จจริง ชี้แจง และบอกช่องทางดำเนินการที่ถูกต้อง",
    directFirstStep: "ส่งสรุปเหตุ ผลกระทบ และสิ่งที่ต้องการ พร้อมขอชื่อหน่วยงานหรือเจ้าหน้าที่ผู้รับผิดชอบ",
    complaintTitle: "ยื่นเรื่องอย่างเป็นทางการเมื่อระบุผู้รับผิดชอบได้",
    complaintSummary: "ทำหนังสือที่แยกข้อเท็จจริง ผลกระทบ หลักฐาน และคำขอ แล้วส่งผ่านช่องทางที่ติดตามได้",
    complaintFirstStep: "ตรวจอำนาจหน่วยงานและกำหนดเวลาก่อนยื่น พร้อมเก็บสำเนาและขอเลขอ้างอิง",
    evidenceFirstStep: "เริ่มจากลำดับเหตุการณ์ บุคคลหรือหน่วยงานที่เกี่ยวข้อง ผลกระทบ และสิ่งที่เคยทำไปแล้ว",
  },
};

function detectSpecificIssue(context: string): SpecificIssue {
  if (/(หลอกโอน|ดูดเงิน|มิจฉาชีพ|แฮกบัญชี|บัญชีถูกแฮก|โกงเงิน)/u.test(context)) return "cyber";
  if (/(ไม่จ่ายค่าจ้าง|ค้างค่าจ้าง|ไม่จ่ายเงินเดือน|เลิกจ้าง|นายจ้าง|ลูกจ้าง|ค่าล่วงเวลา)/u.test(context)) return "labour";
  if (/(น้ำเสีย|มลพิษ|ปล่อยควัน|สารเคมี|กลิ่นเหม็น|ฝุ่นจากโรงงาน)/u.test(context)) return "environment";
  if (/(ขอข้อมูลข่าวสาร|ขอเอกสาร|ไม่ให้ข้อมูล|ปฏิเสธเปิดเผย|ไม่ตอบคำขอข้อมูล)/u.test(context)) return "official-information";
  if (/(เปิดเผยข้อมูลส่วนบุคคล|เผยแพร่ข้อมูลส่วนตัว|สวมรอย|ปลอมบัญชี|เผยแพร่คลิป|เผยแพร่ภาพ)/u.test(context)) return "privacy";
  if (/(ซื้อสินค้า|สั่งซื้อ|ผู้ขาย|ร้านค้า|คืนเงิน|ไม่ได้รับสินค้า|สินค้าไม่ตรงปก|โฆษณาเกินจริง)/u.test(context)) return "consumer";
  if (/(ไม่รับเรื่อง|เพิกเฉย|ไม่ดำเนินการ|ละเลยหน้าที่|เจ้าหน้าที่|หน่วยงานรัฐ|เทศบาล|อบต)/u.test(context)) return "state";
  return "general";
}

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

export function suggestActionOptions(context: string): ActionOption[] {
  const normalizedContext = context.toLocaleLowerCase("th-TH");
  const hasSafetyConcern = safetyKeywords.some((keyword) => hasAffirmedKeyword(normalizedContext, keyword));
  const hasEvidence = evidenceKeywords.some((keyword) => hasAffirmedKeyword(normalizedContext, keyword));
  const involvesState = stateKeywords.some((keyword) => normalizedContext.includes(keyword));
  const specificIssue = detectSpecificIssue(normalizedContext);
  const specific = issueGuidance[specificIssue];

  const options: ActionOption[] = [
    {
      id: "safety-support",
      title: "ขอความช่วยเหลือด้านความปลอดภัยก่อน",
      summary: "ให้เจ้าหน้าที่หรือองค์กรช่วยประเมินความเสี่ยง วางช่องทางติดต่อที่ปลอดภัย และพิจารณาการสงวนข้อมูลก่อนเปิดเรื่อง",
      suitableWhen: "กังวลว่าจะถูกข่มขู่ ตอบโต้ เปิดเผยชื่อ หรือเกิดอันตรายหลังดำเนินการ",
      firstStep: "เลือกช่องทางติดต่อที่ปลอดภัยและบอกเจ้าหน้าที่ตั้งแต่ต้นว่ามีความเสี่ยงใด",
      benefit: "ลดโอกาสเปิดเผยข้อมูลหรือดำเนินการโดยไม่มีแผนรองรับ",
      limitation: "อาจต้องเล่าข้อมูลบางส่วนให้ผู้ช่วยเข้าใจก่อน และยังไม่ใช่การแก้ปัญหาหลักทันที",
      possibleOutcome: "ได้แผนลดความเสี่ยง ผู้ช่วยประสานงาน หรือคำแนะนำว่าควรดำเนินการเมื่อใด",
      effort: "ปานกลาง",
      disclosure: "ต่ำ",
      recommendedReason: hasSafetyConcern ? "เรื่องที่เล่ามีความกังวลด้านความปลอดภัยหรือการเปิดเผยตัวตน" : undefined,
    },
    {
      id: "preserve-evidence",
      title: "เก็บและจัดลำดับหลักฐานเพิ่ม",
      summary: "รวบรวมลำดับเหตุการณ์ เอกสาร ภาพ ข้อความ พยาน และหลักฐานผลกระทบไว้กับผู้ใช้ก่อนติดต่อหน่วยงาน",
      suitableWhen: "ข้อเท็จจริงยังไม่ชัด หลักฐานอาจถูกลบ หรือยังไม่พร้อมเปิดเผยตัวตน",
      firstStep: specific.evidenceFirstStep,
      benefit: "ช่วยให้เล่าเรื่องได้ตรงกันและลดการต้องให้ข้อมูลซ้ำ",
      limitation: "ปัญหาอาจยังไม่หยุด และไม่ควรรอเก็บหลักฐานหากมีอันตรายหรือใกล้ครบกำหนดเวลา",
      possibleOutcome: "ได้ชุดข้อเท็จจริงและบัญชีหลักฐานที่พร้อมใช้ขอคำปรึกษาหรือยื่นเรื่อง",
      effort: "ปานกลาง",
      disclosure: "ต่ำ",
      recommendedReason: hasEvidence ? "เรื่องที่เล่าระบุว่ามีหลักฐานบางส่วนแล้ว จึงสามารถจัดเป็นชุดได้" : "ยังควรตรวจว่ามีหลักฐานใดหาเพิ่มได้โดยปลอดภัย",
    },
    {
      id: "seek-advice",
      title: "ขอคำปรึกษาก่อนเลือกช่องทาง",
      summary: "ให้เจ้าหน้าที่รับเรื่อง นักกฎหมาย หรือองค์กรช่วยเหลือตรวจข้อเท็จจริง สิทธิ กำหนดเวลา และความเสี่ยงก่อนยื่นอย่างเป็นทางการ",
      suitableWhen: "เรื่องซับซ้อน เกี่ยวข้องหลายฝ่าย ไม่แน่ใจเรื่องกำหนดเวลา หรือยังไม่พร้อมร้องเรียน",
      firstStep: "เตรียมสรุปเรื่องหนึ่งหน้าและคำถามที่อยากทราบ โดยตัดข้อมูลส่วนบุคคลที่ไม่จำเป็นออก",
      benefit: "ช่วยลดการส่งผิดช่องทางและเห็นประเด็นที่ควรระวังก่อนเปิดเผยข้อมูล",
      limitation: "คำปรึกษาอาจต่างกันตามข้อมูลที่ให้ และบางบริการอาจต้องนัดหมายหรือรอคิว",
      possibleOutcome: "ได้ความเห็นเบื้องต้น รายการข้อมูลที่ขาด และช่องทางที่เหมาะสำหรับดำเนินการต่อ",
      effort: "ปานกลาง",
      disclosure: "ปานกลาง",
    },
    {
      id: "contact-owner",
      title: specific.directTitle,
      summary: specific.directSummary,
      suitableWhen: "ผู้รับผิดชอบชัดเจน ต้องการให้แก้ปัญหาเร็ว และการติดต่อไม่เพิ่มความเสี่ยง",
      firstStep: specific.directFirstStep,
      benefit: "อาจแก้ปัญหาได้เร็วและได้คำชี้แจงจากผู้รับผิดชอบโดยตรง",
      limitation: "อีกฝ่ายอาจไม่ตอบ ปฏิเสธ หรือรับทราบตัวผู้แจ้ง จึงต้องพิจารณาความปลอดภัยก่อน",
      possibleOutcome: "ได้รับการแก้ไข คำชี้แจง เลขรับเรื่อง หรือหลักฐานว่าเคยขอให้ดำเนินการแล้ว",
      effort: "น้อย",
      disclosure: "ปานกลาง",
      recommendedReason: specificIssue !== "general" ? `ตรงกับ${specific.label}` : involvesState ? "เรื่องที่เล่ามีหน่วยงานหรือเจ้าหน้าที่ซึ่งอาจเป็นผู้รับผิดชอบโดยตรง" : undefined,
    },
    {
      id: "formal-complaint",
      title: specific.complaintTitle,
      summary: specific.complaintSummary,
      suitableWhen: "ต้องการหลักฐานการรับเรื่อง ต้องการให้ตรวจสอบอย่างเป็นทางการ หรือเคยติดต่อแล้วแต่ยังไม่ได้รับการแก้ไข",
      firstStep: specific.complaintFirstStep,
      benefit: "มีหลักฐานการยื่น เลขอ้างอิง และจุดเริ่มต้นสำหรับติดตามหรือดำเนินการต่อ",
      limitation: "อาจใช้เวลา ต้องให้ข้อมูลเพิ่ม และบางกรณีผู้ถูกร้องอาจทราบข้อมูลของผู้ร้อง",
      possibleOutcome: "หน่วยงานรับไว้ตรวจสอบ ขอข้อมูลเพิ่ม ส่งต่อ แจ้งว่าไม่อยู่ในอำนาจ หรือแจ้งผลการพิจารณา",
      effort: "มาก",
      disclosure: "สูง",
      recommendedReason: specificIssue !== "general" ? `เป็นช่องทางทางการสำหรับ${specific.label}` : undefined,
    },
  ];

  return options.sort((left, right) => Number(Boolean(right.recommendedReason)) - Number(Boolean(left.recommendedReason)));
}
