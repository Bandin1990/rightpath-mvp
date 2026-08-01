# แผนพัฒนา MVP 90 วัน

## Sprint 0 — สัปดาห์ 1–2: ตรึงโจทย์และ governance

- เลือกปัญหานำร่อง 1 ประเภทและหน่วยงาน 3–4 แห่ง
- ตั้งเจ้าของข้อมูล Editor/Reviewer/Publisher และ SLA ตรวจทุก 30–90 วัน
- สร้าง expert-reviewed test cases 20–30 กรณี รวม edge/high-risk cases
- ทำ DPIA/threat model/data-flow review และตกลงคำรับรอง privacy
- ตั้ง repo protection, CI, Supabase dev project และ Cloudflare preview

ผ่านเมื่อ: scope, sources, test oracle, risk acceptance และผู้รับผิดชอบได้รับอนุมัติ

## Sprint 1 — สัปดาห์ 3–4: ฐานความรู้

- นำเข้า sources/documents/sections แบบ allow-list
- สร้างสิทธิ ประเภทปัญหา หน่วยงาน ช่องทาง routing/risk rules
- ทำ editorial workflow แบบ manual ก่อน ไม่สร้าง admin portal
- RLS tests: anon เห็น published เท่านั้น เขียนไม่ได้ และ draft/expired หาย
- hybrid search evaluation ภาษาไทย

ผ่านเมื่อ: ความรู้ชุดแรกตรวจสองคน มี source/validity/last_verified ครบ และ DB advisor ไม่มี finding สำคัญ

## Sprint 2 — สัปดาห์ 5–6: เล่าเรื่องและรู้สิทธิ

- emergency gate และคำถาม 10–15 ข้อ
- transient fact extraction + timeline confirmation
- rights explanation จาก rule + citations
- privacy/network/log automated checks
- usability test 5–8 คน รอบแรก

ผ่านเมื่อ: ผู้ใช้ 80% เล่าเรื่องและตรวจ timeline ได้; ไม่มีเนื้อหาใน storage/log/database

## Sprint 3 — สัปดาห์ 7–8: ทางเลือก หน่วยงาน ความเสี่ยง

- deterministic rule engine พร้อม explanation trace
- options comparison และ desired-outcome matching
- risk check 6 ด้าน + mitigation
- confidence/fallback/human handoff
- expert regression suite ทุกกรณี

ผ่านเมื่อ: routing agreement ≥85% และ high-risk cases fail closed

## Sprint 4 — สัปดาห์ 9–10: ชุดร้องเรียน

- complaint template rendering ใน browser
- timeline/evidence checklist/submission guide
- Word/PDF + review/consent screen
- ตรวจ XSS/formula injection/document metadata leakage
- usability test รอบสอง

ผ่านเมื่อ: เอกสาร synthetic cases ครบ ≥90% และไม่มีไฟล์/สำเนาบน server

## Sprint 5 — สัปดาห์ 11: Security & resilience

- Cloudflare managed WAF/rate limits/Turnstile/circuit breaker
- load/abuse/denial-of-wallet tests
- SAST/dependency/secret scan และ prompt-injection red team
- backup restore, knowledge rollback, secret rotation, incident tabletop

ผ่านเมื่อ: public static path อยู่ได้เมื่อ AI ถูกปิด และไม่มี High finding ค้างโดยไม่มี risk acceptance

## Sprint 6 — สัปดาห์ 12–13: Controlled pilot

- pilot กลุ่มเล็กโดยมีเจ้าหน้าที่ช่วยเหลือและ feedback channel
- วัดเฉพาะ aggregate metrics ที่อนุมัติ
- ตรวจ false route, confusing language, risk warnings และ abandonment
- go/no-go พร้อม rollback plan และรายการที่ยังไม่ควรเปิด

ผ่านเมื่อ: Product owner, legal/content reviewer, privacy และ security sign-off

## ลำดับงานแนะนำให้ Codex ทำต่อ

1. สร้าง emergency gate + multi-step state machine โดยคง browser-memory invariant
2. เพิ่ม synthetic fixtures และ rule-engine unit tests ก่อนต่อ AI
3. เพิ่ม `/api/knowledge/rights`, `/routing`, `/risks` แบบ read-only
4. เพิ่ม transient `/api/analyze` หลัง WAF contract/test พร้อม
5. ทำ client-side complaint package renderer
6. ทำ automated privacy, RLS, accessibility และ end-to-end tests

ห้ามเริ่มจาก admin portal, login, upload evidence, case tracker หรือ direct agency submission เพราะขยาย privacy/security scope เกิน MVP
