export type RightSource = {
  label: string;
  url: string;
};

export type SuggestedRight = {
  id: string;
  title: string;
  plainLanguage: string;
  whyMatched: string;
  whatYouCanDo: string;
  whatToCheck: string;
  confidence: "ตรงกับเรื่องที่เล่า" | "ควรยืนยันข้อมูลเพิ่ม";
  sources: RightSource[];
  lastVerifiedAt: string;
};

type RightRule = Omit<SuggestedRight, "whyMatched" | "confidence"> & {
  strongKeywords: string[];
  supportingKeywords: string[];
  minimumScore: number;
  priority: number;
};

const constitutionSource: RightSource = {
  label: "รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ. 2560 — เว็บไซต์รัฐสภา",
  url: "https://web.parliament.go.th/assets/portals/7/files/constitution2560.pdf",
};

const reviewedAt = "2 สิงหาคม 2569";

const rightRules: RightRule[] = [
  {
    id: "life-and-body",
    title: "สิทธิในชีวิต ร่างกาย และความปลอดภัย",
    plainLanguage: "ถ้ามีการทำร้าย ขู่ฆ่า กักขัง บังคับ หรือคุกคาม คุณขอความคุ้มครองและแจ้งให้หน่วยงานตรวจสอบได้ โดยความปลอดภัยต้องมาก่อนการทำหนังสือ",
    whatYouCanDo: "หากเหตุยังเกิดอยู่ให้โทร 191 หรือขอความช่วยเหลือฉุกเฉินก่อน จากนั้นจดวันเวลา คำขู่ ผู้เกี่ยวข้อง และเก็บหลักฐานโดยไม่เผชิญหน้าผู้ก่อเหตุ",
    whatToCheck: "ตรวจว่าอันตรายยังเกิดอยู่หรือไม่ ผู้ก่อเหตุรู้ที่อยู่หรือช่องทางติดต่อของคุณหรือไม่ และต้องการสงวนข้อมูลใด",
    strongKeywords: ["ขู่ฆ่า", "เอาชีวิต", "ทำร้ายร่างกาย", "กักขัง", "ลักพาตัว", "ใช้อาวุธ", "บังคับ", "ทรมาน"],
    supportingKeywords: ["ข่มขู่", "ทำร้าย", "คุกคาม", "ตามมาที่บ้าน", "กลัว", "ไม่ปลอดภัย"],
    minimumScore: 4,
    priority: 100,
    sources: [constitutionSource],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "labour-protection",
    title: "สิทธิของลูกจ้างเรื่องค่าจ้าง สภาพการทำงาน และการเลิกจ้าง",
    plainLanguage: "ถ้าเป็นปัญหาระหว่างลูกจ้างกับนายจ้าง เช่น ไม่จ่ายค่าจ้าง ค่าล่วงเวลา วันลา หรือเลิกจ้าง คุณขอให้พนักงานตรวจแรงงานตรวจข้อเท็จจริงและพิจารณาคำร้องตามกฎหมายแรงงานได้",
    whatYouCanDo: "รวบรวมสัญญาจ้าง สลิปเงินเดือน ตารางทำงาน แชตกับนายจ้าง และหนังสือเลิกจ้าง แล้วใช้ระบบ e-Service ของกรมสวัสดิการและคุ้มครองแรงงานหรือโทร 1506",
    whatToCheck: "ตรวจสถานะว่าเป็นลูกจ้างหรือผู้รับจ้าง ประเด็นที่ค้างชำระ วันที่เริ่มและสิ้นสุดงาน และสถานที่ทำงาน",
    strongKeywords: ["ไม่จ่ายค่าจ้าง", "ค้างค่าจ้าง", "ไม่จ่ายเงินเดือน", "ไม่จ่ายโอที", "เลิกจ้าง", "ถูกไล่ออก", "นายจ้าง", "ลูกจ้าง"],
    supportingKeywords: ["เงินเดือน", "ค่าล่วงเวลา", "โอที", "วันลา", "สัญญาจ้าง", "ประกันสังคม", "ที่ทำงาน"],
    minimumScore: 4,
    priority: 92,
    sources: [
      { label: "บริการร้องเรียน — กระทรวงแรงงาน", url: "https://www.mol.go.th/service-complaint" },
      { label: "e-Service กรมสวัสดิการและคุ้มครองแรงงาน", url: "https://eservice.labour.go.th/register/esrvq101/lcs" },
    ],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "privacy-reputation-and-personal-data",
    title: "สิทธิในข้อมูลส่วนบุคคล ความเป็นส่วนตัว และชื่อเสียง",
    plainLanguage: "ถ้ามีคนนำข้อมูลส่วนตัว ภาพ คลิป หรือบัญชีของคุณไปเก็บ ใช้ เปิดเผย หรือสวมรอย คุณอาจขอให้ผู้ดูแลข้อมูลหยุด แก้ไข ลบ หรือชี้แจง และร้องเรียนต่อหน่วยงานที่เกี่ยวข้องได้",
    whatYouCanDo: "เก็บภาพหน้าจอ URL ชื่อบัญชี วันเวลา และคำตอบจากผู้ดูแลระบบไว้ก่อน อย่าส่งต่อภาพหรือข้อมูลที่สร้างความเสียหายเกินจำเป็น",
    whatToCheck: "ตรวจว่าเป็นการใช้ข้อมูลโดยองค์กรที่อยู่ภายใต้กฎหมายคุ้มครองข้อมูล หรือเป็นการแฮก สวมรอย ข่มขู่ หรือหมิ่นประมาทที่ต้องใช้ช่องทางตำรวจด้วย",
    strongKeywords: ["เปิดเผยข้อมูลส่วนบุคคล", "เผยแพร่ข้อมูลส่วนตัว", "เอาข้อมูลไปใช้", "แฮกบัญชี", "บัญชีถูกแฮก", "สวมรอย", "ปลอมบัญชี", "เผยแพร่คลิป", "เผยแพร่ภาพ"],
    supportingKeywords: ["ข้อมูลส่วนบุคคล", "ข้อมูลส่วนตัว", "ประจาน", "ชื่อเสียง", "รูปภาพ", "คลิป", "โซเชียล", "เฟซบุ๊ก", "ไลน์"],
    minimumScore: 4,
    priority: 90,
    sources: [
      constitutionSource,
      { label: "ระบบรับเรื่องร้องเรียน — สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล", url: "https://complaint.pdpc.or.th/" },
    ],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "community-and-environment",
    title: "สิทธิของบุคคลและชุมชนด้านสิ่งแวดล้อมและสุขภาพ",
    plainLanguage: "ถ้ามลพิษจากโรงงาน กิจการ หรือแหล่งกำเนิดกระทบสุขภาพ บ้าน หรือการดำรงชีวิต คุณแจ้งเหตุ ขอให้ตรวจแหล่งกำเนิด และขอทราบผลการดำเนินการได้",
    whatYouCanDo: "ระบุจุดเกิดเหตุ แหล่งกำเนิด ช่วงเวลาที่เกิดซ้ำ กลิ่น สี เสียง หรืออาการที่พบ แล้วแจ้งกรมควบคุมมลพิษผ่าน ECAP พร้อมขอเลขรับเรื่อง",
    whatToCheck: "ตรวจว่ามีอันตรายทันทีหรือไม่ แหล่งกำเนิดอยู่ในพื้นที่ใด มีผู้ได้รับผลกระทบกี่คน และเคยมีหน่วยงานใดมาตรวจแล้วหรือไม่",
    strongKeywords: ["น้ำเสีย", "ปล่อยควัน", "ปล่อยสารเคมี", "กลิ่นเหม็น", "ฝุ่นจากโรงงาน", "มลพิษ", "ปนเปื้อน", "เสียงดังจาก"],
    supportingKeywords: ["โรงงาน", "ควัน", "ฝุ่น", "กลิ่น", "สารเคมี", "สิ่งแวดล้อม", "ชุมชน", "แม่น้ำ", "สุขภาพ"],
    minimumScore: 4,
    priority: 88,
    sources: [
      constitutionSource,
      { label: "ระบบรับแจ้งเรื่องร้องเรียนด้านมลพิษ ECAP — กรมควบคุมมลพิษ", url: "https://ecap.pcd.go.th/ecap/home/defaulted" },
    ],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "consumer-protection",
    title: "สิทธิของผู้บริโภคเกี่ยวกับสินค้า บริการ โฆษณา และสัญญา",
    plainLanguage: "ถ้าคุณซื้อสินค้า หรือจ่ายค่าบริการแล้วไม่ได้ตามที่ตกลง ถูกโฆษณาให้เข้าใจผิด หรือไม่ได้รับความเป็นธรรมในสัญญา คุณร้องทุกข์และขอให้ตรวจสอบหรือประสานการเยียวยาได้",
    whatYouCanDo: "ทวงถามผู้ขายเป็นข้อความ เก็บใบเสร็จ สัญญา โฆษณา และแชต แล้วร้องทุกข์ผ่านระบบ OCPB Connect หากตกลงกันไม่ได้",
    whatToCheck: "ตรวจว่าสินค้าหรือบริการนั้นมีหน่วยงานกำกับเฉพาะหรือไม่ ชำระเงินเมื่อใด ผู้ขายรับปากอะไร และคุณต้องการคืนเงิน แก้ไข หรือชดเชยอย่างไร",
    strongKeywords: ["ซื้อสินค้า", "สั่งซื้อ", "ผู้ขาย", "ร้านค้า", "คืนเงิน", "โฆษณาเกินจริง", "ไม่ได้รับสินค้า", "สินค้าไม่ตรงปก", "สัญญาไม่เป็นธรรม"],
    supportingKeywords: ["ใบเสร็จ", "รับประกัน", "ผู้บริโภค", "จ่ายเงิน", "บริการ", "สัญญา", "โฆษณา"],
    minimumScore: 4,
    priority: 84,
    sources: [
      { label: "สิทธิผู้บริโภค 5 ประการ — สำนักงานคณะกรรมการคุ้มครองผู้บริโภค", url: "https://www.ocpb.go.th/news_view.php?nid=35" },
      { label: "ระบบร้องทุกข์ออนไลน์ สคบ.", url: "https://complaint.ocpb.go.th/" },
    ],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "official-information",
    title: "สิทธิขอข้อมูลข่าวสารจากหน่วยงานของรัฐ",
    plainLanguage: "ถ้าคุณยื่นขอเอกสารหรือข้อมูลที่หน่วยงานรัฐครอบครองแล้วไม่ได้รับคำตอบ ถูกปฏิเสธ หรือให้ข้อมูลไม่ครบ คุณอาจร้องเรียนหรืออุทธรณ์ผ่านกลไกข้อมูลข่าวสารของราชการได้",
    whatYouCanDo: "เก็บสำเนาคำขอ วันที่ยื่น และคำปฏิเสธ แล้วใช้ระบบร้องเรียนหรืออุทธรณ์ดิจิทัลของ สขร. ตามลักษณะคำตอบที่ได้รับ",
    whatToCheck: "ตรวจว่าหน่วยงานได้รับคำขอวันใด ข้อมูลใดที่ขอ มีหนังสือปฏิเสธหรือยัง และต้องร้องเรียนหรืออุทธรณ์ช่องทางใด",
    strongKeywords: ["ขอข้อมูลข่าวสาร", "ขอเอกสาร", "ไม่ให้ข้อมูล", "ปฏิเสธเปิดเผย", "ปฏิเสธข้อมูล", "ไม่ตอบคำขอข้อมูล"],
    supportingKeywords: ["สำเนาเอกสาร", "ข้อมูลของราชการ", "หนังสือปฏิเสธ", "ข้อมูลข่าวสาร"],
    minimumScore: 4,
    priority: 82,
    sources: [
      { label: "สิทธิของประชาชนตามกฎหมายข้อมูลข่าวสาร — สขร.", url: "https://www.oic.go.th/web2017/people01.htm" },
      { label: "ระบบร้องเรียนและอุทธรณ์ดิจิทัล — สขร.", url: "https://www.oic.go.th/e-ca/admin_oic_eca/home.aspx" },
    ],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "petition-and-official-response",
    title: "สิทธิร้องทุกข์ต่อหน่วยงานรัฐและขอทราบผล",
    plainLanguage: "ถ้าหน่วยงานหรือเจ้าหน้าที่รัฐไม่ทำตามหน้าที่ ไม่รับเรื่อง ล่าช้า หรือใช้อำนาจจนคุณเดือดร้อน คุณยื่นเรื่องเป็นลายลักษณ์อักษร ขอเลขรับ และขอให้แจ้งผลได้",
    whatYouCanDo: "เริ่มที่หน่วยงานต้นสังกัดหรือหน่วยงานเจ้าของเรื่องก่อน โดยระบุเหตุ วันที่เคยติดต่อ สิ่งที่ยังไม่ได้รับการแก้ไข และขอเลขรับเรื่องทุกครั้ง",
    whatToCheck: "ตรวจว่าหน่วยงานใดมีหน้าที่โดยตรง เคยยื่นเรื่องเมื่อใด ได้คำตอบอะไร และมีคดีหรือกำหนดเวลาอื่นกำลังเดินอยู่หรือไม่",
    strongKeywords: ["ไม่รับเรื่อง", "เพิกเฉย", "ไม่ดำเนินการ", "ละเลยหน้าที่", "ใช้อำนาจไม่เป็นธรรม", "เจ้าหน้าที่ปฏิเสธ", "หน่วยงานไม่ตอบ"],
    supportingKeywords: ["เจ้าหน้าที่", "หน่วยงานรัฐ", "ราชการ", "เทศบาล", "อบต", "อำเภอ", "จังหวัด", "กระทรวง", "กรม"],
    minimumScore: 4,
    priority: 78,
    sources: [constitutionSource],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "equality-and-non-discrimination",
    title: "สิทธิในความเสมอภาคและไม่ถูกเลือกปฏิบัติโดยไม่เป็นธรรม",
    plainLanguage: "ถ้าคุณถูกปฏิบัติแตกต่างเพราะเพศ ความพิการ ชาติพันธุ์ ศาสนา อายุ หรือสถานะส่วนบุคคล เรื่องนี้อาจเป็นการเลือกปฏิบัติที่ควรได้รับการตรวจสอบ",
    whatYouCanDo: "บันทึกว่าใครถูกปฏิบัติแตกต่างจากใคร เหตุการณ์เกิดเมื่อใด คำพูดหรือหลักเกณฑ์ใดถูกใช้ และผลกระทบที่เกิดขึ้น",
    whatToCheck: "ต้องแยกความรู้สึกว่าไม่เป็นธรรมออกจากข้อเท็จจริงที่แสดงว่ามีคนในสถานการณ์ใกล้เคียงกันได้รับการปฏิบัติต่างกัน",
    strongKeywords: ["เลือกปฏิบัติ", "เหยียด", "กีดกันเพราะ", "ไม่รับเพราะพิการ", "ไม่รับเพราะเพศ", "แบ่งแยก"],
    supportingKeywords: ["ความพิการ", "ชาติพันธุ์", "เชื้อชาติ", "ศาสนา", "เพศ", "อายุ", "ฐานะ"],
    minimumScore: 4,
    priority: 76,
    sources: [constitutionSource],
    lastVerifiedAt: reviewedAt,
  },
  {
    id: "property-and-fraud",
    title: "สิทธิในทรัพย์สินและการขอให้ตรวจสอบการหลอกลวง",
    plainLanguage: "ถ้าเงินหรือทรัพย์สินถูกหลอกเอาไป ขโมย ยึด หรือทำให้เสียหาย คุณแจ้งเหตุและขอให้ตรวจสอบได้ แต่กรณีเงินกำลังถูกโอนต้องติดต่อธนาคารและตำรวจไซเบอร์ทันที",
    whatYouCanDo: "หยุดติดต่อมิจฉาชีพ โทรธนาคาร อายัดช่องทางที่ทำได้ โทร 1441 และเก็บสลิป แชต URL และชื่อบัญชีไว้ โดยไม่เปิดเผยรหัสผ่านหรือ OTP",
    whatToCheck: "ตรวจว่ายังมีธุรกรรมเกิดขึ้นหรือไม่ เป็นข้อพิพาทตามสัญญาหรือการหลอกลวง และได้แจ้งธนาคารหรือตำรวจแล้วหรือยัง",
    strongKeywords: ["หลอกโอน", "ดูดเงิน", "มิจฉาชีพ", "ขโมย", "ยึดทรัพย์", "อายัดทรัพย์", "โกงเงิน", "เงินหายจากบัญชี"],
    supportingKeywords: ["โอนเงิน", "บัญชีธนาคาร", "ทรัพย์สิน", "สลิป", "เสียหาย"],
    minimumScore: 4,
    priority: 94,
    sources: [constitutionSource, { label: "แจ้งความออนไลน์ — สำนักงานตำรวจแห่งชาติ", url: "https://www.thaipoliceonline.go.th/" }],
    lastVerifiedAt: reviewedAt,
  },
];

const fallbackRight: SuggestedRight = {
  id: "need-more-facts",
  title: "ยังระบุสิทธิเฉพาะเรื่องไม่ได้อย่างปลอดภัย",
  plainLanguage: "ข้อมูลที่มีอาจเกี่ยวกับสิทธิหลายด้าน แต่ยังไม่มีข้อเท็จจริงเฉพาะพอที่จะชี้ไปที่สิทธิข้อใดโดยไม่ทำให้เข้าใจผิด",
  whyMatched: "ยังไม่พบเหตุ การกระทำ ผู้เกี่ยวข้อง และผลกระทบที่จับคู่กับกฎเฉพาะได้",
  whatYouCanDo: "กลับไปเพิ่มว่าใครทำอะไร เมื่อใด ผลกระทบคืออะไร เคยขอให้ใครแก้ไขแล้วหรือไม่ และต้องการผลอย่างไร",
  whatToCheck: "หากมีอันตราย กำหนดเวลาศาล หรือความเสียหายกำลังเกิดขึ้น ให้ขอความช่วยเหลือจากเจ้าหน้าที่ก่อนรอวิเคราะห์ในระบบ",
  confidence: "ควรยืนยันข้อมูลเพิ่ม",
  sources: [constitutionSource],
  lastVerifiedAt: reviewedAt,
};

function hasAffirmedPhrase(context: string, phrase: string) {
  let searchFrom = 0;
  while (searchFrom < context.length) {
    const phraseIndex = context.indexOf(phrase, searchFrom);
    if (phraseIndex < 0) return false;
    const prefix = context.slice(Math.max(0, phraseIndex - 40), phraseIndex);
    if (!/(?:ไม่มี|ยังไม่มี|ไม่เคย|ไม่ได้|ไม่กังวล|ไม่ต้องการ)[^.!?\n]{0,40}$/u.test(prefix)) return true;
    searchFrom = phraseIndex + phrase.length;
  }
  return false;
}

export function suggestRights(storyText: string, limit = 3): SuggestedRight[] {
  const normalizedText = storyText.replace(/\s+/gu, " ").toLocaleLowerCase("th-TH");
  const matched = rightRules
    .map((rule) => {
      const strong = rule.strongKeywords.filter((keyword) => hasAffirmedPhrase(normalizedText, keyword.toLocaleLowerCase("th-TH")));
      const supporting = rule.supportingKeywords.filter((keyword) => hasAffirmedPhrase(normalizedText, keyword.toLocaleLowerCase("th-TH")));
      const score = strong.length * 4 + supporting.length + rule.priority / 100;
      return { rule, strong, supporting, score };
    })
    .filter(({ rule, strong, supporting }) => strong.length > 0 && strong.length * 4 + supporting.length >= rule.minimumScore)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ rule, strong, supporting }) => {
      const matchedPhrases = [...strong, ...supporting].slice(0, 4);
      return {
        id: rule.id,
        title: rule.title,
        plainLanguage: rule.plainLanguage,
        whyMatched: `ตรงกับข้อเท็จจริงที่มีคำหรือเหตุลักษณะ “${matchedPhrases.join("”, “")}”`,
        whatYouCanDo: rule.whatYouCanDo,
        whatToCheck: rule.whatToCheck,
        confidence: strong.length >= 2 || (strong.length >= 1 && supporting.length >= 2) ? "ตรงกับเรื่องที่เล่า" as const : "ควรยืนยันข้อมูลเพิ่ม" as const,
        sources: rule.sources,
        lastVerifiedAt: rule.lastVerifiedAt,
      };
    });

  return matched.length > 0 ? matched : [fallbackRight];
}
