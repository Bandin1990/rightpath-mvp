# สิทธิไปต่อ (RightPath MVP)

โครงการตั้งต้นสำหรับระบบที่ช่วยประชาชนตาม Flow ต้นฉบับ 11 ขั้น: **ตรวจเหตุเร่งด่วน → เล่าปัญหาด้วยภาษาของประชาชน → ระบบจัดลำดับข้อเท็จจริงและถามข้อมูลที่ขาด → รู้ว่าสิทธิใดอาจเกี่ยวข้อง → รู้ว่ามีทางเลือกอะไรบ้าง → เปรียบเทียบผลดี ข้อจำกัด และผลที่อาจตามมา → รู้ว่าหน่วยงานใดช่วยเรื่องใดได้ → ประเมินความเสี่ยงและวิธีลดความเสี่ยง → ผู้ใช้เลือกว่าจะร้อง ขอคำปรึกษา หรือเก็บข้อมูลเพิ่ม → สร้างหนังสือร้องเรียนและชุดเอกสารพร้อมยื่น → ส่งเรื่อง รับเลขอ้างอิง และติดตามผล** ระบบออกแบบให้ฐานข้อมูลเก็บเฉพาะองค์ความรู้สาธารณะที่ผ่านการตรวจทาน ไม่เก็บเรื่องเล่า ตัวตน ร่างคำร้อง หรือประวัติสนทนาของประชาชน

## สิ่งที่พร้อมแล้ว

- Next.js 16 App Router + TypeScript + Tailwind CSS
- หน้าคัดกรองภัยเร่งด่วน 28 รายการ พร้อมจับคู่ข้อความอิสระกับหน่วยงานเฉพาะเจาะจงด้วยกฎคำสำคัญในเบราว์เซอร์
- การเล่าด้วยเสียงที่ขอสิทธิไมโครโฟนทันที และมีทางลัดไปเปิดใน Chrome/Edge เมื่อหน้าต่างเว็บไม่รองรับ
- หน้า Workflow ที่เก็บข้อความใน React memory เท่านั้น
- Route Handler ตัวอย่างสำหรับอ่านฐานความรู้ผ่าน server
- Supabase PostgreSQL migration พร้อม `pgvector`, hybrid search, RLS และ `api` schema แบบ read-only
- ระบบหลังบ้าน `/admin` สำหรับตรวจ เพิ่ม แก้ไข และเผยแพร่หน่วยงาน ช่องทาง ภัย และคำจับคู่ ผ่าน Supabase Auth/RLS
- Cloudflare Workers/OpenNext config และ security headers
- เอกสารสถาปัตยกรรม ความปลอดภัย Product Spec และแผน 90 วัน

## เริ่มใช้งาน

ต้องมี Node.js 22 ขึ้นไป และ npm

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

เปิด `http://localhost:3000` ส่วนหน้าเว็บทำงานได้แม้ยังไม่ตั้ง Supabase ส่วน API ฐานความรู้จะตอบ `503 knowledge_not_configured` และใช้ชุดข้อมูลที่รวมมากับแอปจนกว่าจะใส่ค่าจริงใน `.env.local` ระบบหลังบ้านอยู่ที่ `/admin` และมีวิธีเปิดใช้ใน `docs/ADMIN_GUIDE.md`

## Supabase local

ต้องเปิด Docker Desktop ก่อน แล้วจึงใช้:

```powershell
npm run db:start
npm run db:reset
npm run db:lint
```

Migration อยู่ใน `supabase/migrations/` และ `database/schema.sql` เป็น entry point ที่เรียก migration ปัจจุบันทั้งหมดสำหรับผู้ใช้ `psql`

เมื่อต้องเปลี่ยน schema ให้สร้าง migration ผ่าน CLI ก่อนเสมอ:

```powershell
npx supabase migration new ชื่อการเปลี่ยนแปลง
```

## ตรวจโครงการ

```powershell
npm run check
```

คำสั่งนี้ตรวจ lint, TypeScript และ production build ตามลำดับ

## ทดลองและนำขึ้น Cloudflare

```powershell
npm run preview
npm run deploy
```

ก่อน deploy ให้ตั้ง secrets บน Cloudflare Workers โดยไม่ใส่ไว้ใน Git:

```powershell
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
```

จากนั้นตั้ง WAF/rate limiting ตาม `docs/CLOUDFLARE_SECURITY.md`

## หลักห้ามละเมิด

- ห้ามสร้างตาราง `users`, `cases`, `case_answers`, `conversations`, `generated_complaints`
- ห้ามใช้ `localStorage`, `sessionStorage` หรือ IndexedDB เก็บเรื่องเล่า
- ห้าม log request body, prompt, AI response หรือหนังสือร้องเรียน
- ห้ามใช้ `NEXT_PUBLIC_*` กับ secret หรือ Supabase secret/service-role key
- AI ช่วยแยกและเรียบเรียงเท่านั้น การเลือกสิทธิ/หน่วยงานต้องผ่านกฎที่เผยแพร่แล้ว

อ่านรายละเอียดต่อที่ `ARCHITECTURE.md`, `SECURITY_PRIVACY.md`, `PRODUCT_SPEC.md`, `DEVELOPMENT_PLAN.md` และ `docs/ADMIN_GUIDE.md`
