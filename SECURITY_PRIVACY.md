# Security & Privacy Baseline

## คำรับรองที่ใช้ได้

> ระบบไม่เก็บเนื้อหาเรื่องร้องเรียน ตัวตน หลักฐาน หรือหนังสือร้องเรียนของประชาชนไว้ในฐานข้อมูลแอป

ห้ามใช้คำว่า “ไม่มีการประมวลผลข้อมูลส่วนบุคคลเลย” เพราะ Cloudflare, เครือข่าย และผู้ให้บริการโครงสร้างพื้นฐานอาจประมวลผล IP/User-Agent และ security metadata ชั่วคราว

ไม่มีระบบใดรับประกันว่าแฮ็กไม่ได้ เป้าหมายคือป้องกันหลายชั้น จำกัดผลกระทบ ตรวจพบ และกู้คืนได้

## Threat model

ทรัพย์สินสำคัญคือความถูกต้องของกฎ/แหล่งอ้างอิง, secrets, availability และข้อมูลชั่วคราวของผู้ใช้ ผู้โจมตีอาจพยายาม:

- DDoS/resource exhaustion โดยเฉพาะ endpoint ที่เรียก AI
- SQL injection, XSS, CSRF, SSRF, broken authorization
- ขโมย secret หรือแก้กฎ/ช่องทางร้องเรียน
- prompt injection/indirect prompt injection และ knowledge poisoning
- ทำให้ระบบ log หรือเก็บเรื่องเล่าโดยไม่ตั้งใจ
- supply-chain compromise ผ่าน dependency/build/deploy

## Privacy controls

- ค่าในฟอร์มอยู่ใน React memory; refresh/ปิดหน้าจะลบ
- ไม่ใช้ localStorage, sessionStorage, IndexedDB, draft autosave หรือ user account
- ไม่ส่งเรื่องเล่าใน URL/query string และไม่ใช้ GET สำหรับเนื้อหา
- Route Handler ห้าม log request body/prompt/output; error ตอบเฉพาะ code ทั่วไป
- สร้าง Word/PDF ใน browser และให้ผู้ใช้ตรวจ/ดาวน์โหลดเอง
- ไม่ติดตั้ง session replay, ad tracker หรือ analytics ที่อ่านข้อความ
- Metrics อนุญาตเฉพาะจำนวนรวม latency, status code, rule ID แบบไม่ผูกบุคคล และ token aggregate
- AI เป็น opt-in แยกจากโหมดพื้นฐาน ผู้ใช้ต้องยินยอมก่อนส่งข้อความทุกครั้ง และระบบต้องส่งข้อมูลขั้นต่ำเท่านั้น
- Cloudflare Workers AI เป็น provider ตั้งต้น โดยตรวจเงื่อนไข no-training/data usage ก่อน production และห้ามเก็บ prompt/output ใน application storage หรือ logs
- Service worker/Cache Storage cache ได้เฉพาะไฟล์ static ของแอป ห้าม cache POST, API AI, เรื่องเล่า หรือผลลัพธ์เฉพาะบุคคล

### การเล่าปัญหาด้วยเสียง

- ขอสิทธิ์ใช้ไมโครโฟนต่อเมื่อผู้ใช้กด “เล่าด้วยเสียง” เท่านั้น
- แอปไม่บันทึกไฟล์เสียงลงฐานข้อมูล log, object storage หรือ browser storage
- ระบบรู้จำเสียงของเบราว์เซอร์อาจประมวลผลเสียงบนอุปกรณ์หรือผ่านบริการของผู้ให้บริการ ขึ้นอยู่กับเบราว์เซอร์และการตั้งค่าของอุปกรณ์ จึงต้องแจ้งผู้ใช้ก่อนเริ่มใช้งาน
- หากเบราว์เซอร์รองรับ `processLocally` ให้ตรวจ/ติดตั้งชุดภาษาไทยในเครื่องก่อน โดยถือว่าความสามารถนี้เป็น progressive enhancement และต้อง fallback ไปการพิมพ์เสมอ
- เมื่อ speech service จบ session เอง ระบบเริ่ม session ใหม่เฉพาะระหว่างที่ผู้ใช้ยังเปิดสถานะฟังอยู่ และหยุด retry ทันทีเมื่อถูกปฏิเสธสิทธิ ไม่พบไมโครโฟน ภาษาไม่รองรับ หรือเครือข่ายล้มเหลว
- ข้อความที่ถอดจากเสียงอยู่ใน React memory เท่านั้น และหายเมื่อปิดหรือโหลดหน้าใหม่
- ต้องมีการพิมพ์เป็นทางเลือกที่ใช้งานได้ครบ หากเบราว์เซอร์ไม่รองรับหรือผู้ใช้ไม่อนุญาตไมโครโฟน

## Edge และ DDoS

Cloudflare ต้องอยู่หน้า public hostname ทั้งหมด:

1. เปิด DDoS managed ruleset ค่าแนะนำของ Cloudflare
2. เปิด WAF managed rules + custom rules
3. rate-limit แยกตามต้นทุน endpoint ไม่ใช้ limit เดียวทั้งเว็บ
4. cache read-only knowledge responses ที่ edge
5. กำหนด body size, timeout, token budget และ concurrency ceiling
6. มี circuit breaker ปิด AI endpoints แต่ยังให้หน้า static/ข้อมูลพื้นฐานทำงานได้
7. ใช้ Turnstile/managed challenge เฉพาะ traffic ผิดปกติเพื่อลดอุปสรรคผู้ใช้จริง

กฎตั้งต้นอยู่ใน `docs/CLOUDFLARE_SECURITY.md` และต้องปรับตาม plan/traffic จริง

## API controls

- Accept methods ที่จำเป็นเท่านั้น; endpoint ปัจจุบันเป็น GET read-only
- Validate ด้วย allow-list, max length และ schema (`zod`)
- ตั้ง `Cache-Control`, `nosniff`, CSP, frame denial, referrer/permissions policy
- ห้าม outbound fetch ไป URL ที่ผู้ใช้ระบุ; source ingestion ใช้ allow-list และ worker แยก
- ห้าม SQL ต่อ string; ใช้ Supabase query builder/RPC parameters
- จำกัดผลลัพธ์ Data API สูงสุด 100 rows และ search RPC สูงสุด 20
- AI output เป็น untrusted text; escape ตาม context และห้าม render HTML ตรง ๆ

## Database controls

- Data API เปิดเฉพาะ `api` schema
- `anon` อ่านได้เฉพาะ security-invoker views/functions และ underlying published rows ตาม RLS
- ไม่มี write policy สำหรับ public roles
- ไม่มี service-role key ใน frontend; starter นี้ไม่ใช้ service-role เลย
- `review_events`/`ingestion_jobs` ไม่มี public policy/grant
- schema change ทุกครั้งผ่าน migration, review, local reset, lint/advisor
- การ publish จริงต้องมี Editor → Reviewer → Publisher และอนุมัติสองคนสำหรับ routing/risk rules

## Admin plane

MVP มี route `/admin` แยกจาก workflow ประชาชน ใช้ Supabase Auth ผ่าน cookie และตรวจ token ด้วย `getUser()` ทุกครั้งที่อ่านหรือเขียนข้อมูล สิทธิ editor/reviewer/publisher/admin มาจาก `raw_app_meta_data` ซึ่งประชาชนแก้เองไม่ได้ และ RLS ปฏิเสธบัญชีที่ไม่มีบทบาทดังกล่าว

- Server Action ทุกตัวตรวจตัวตนและบทบาทซ้ำ ไม่พึ่ง Proxy เพียงอย่างเดียว
- ใช้ publishable key ผ่าน server เท่านั้น ไม่มี service-role key และไม่มี secret ใน browser
- หน้าประชาชนอ่านเฉพาะข้อมูลสถานะ `published` ผ่าน view แบบ `security_invoker`
- ระบบหลังบ้านจัดการเฉพาะองค์ความรู้ ไม่เข้าถึงเรื่องเล่า เสียง คำตอบ หลักฐาน หรือหนังสือร้องเรียน
- production ต้องบังคับ MFA, short sessions, approval สองคน, audit log ที่ระบุผู้ดำเนินการ และ rollback/version history ก่อนเปิดให้เจ้าหน้าที่จริง
- ingestion จากภายนอกต้องมี source allow-list, malware/content validation และ quarantine

## AI controls

- `/api/ai/story-assist` เปิดเฉพาะบน Cloudflare Worker ที่มี `AI`, `AI_RATE_LIMITER`, body/token limit และปิด invocation logs; หาก binding ใดขาดให้ fail closed
- rate-limit key ใช้ค่า `CF-Connecting-IP` ที่แฮชแล้ว ไม่เก็บหรือลง log และจำกัด 10 ครั้งต่อนาทีต่อ Cloudflare location; ต้องติดตาม false positive จากเครือข่ายมือถือ/NAT
- `AI_ASSIST_ENABLED=false` เป็น circuit breaker สำหรับหยุด AI โดยไม่ปิด workflow แบบกฎ
- Model ไม่มีสิทธิเลือก/แก้ routing rules หรือส่งคำร้อง
- Retrieved content เป็นข้อมูล ไม่ใช่ instruction
- system prompt คงที่และ versioned; tool allow-list; ไม่มี arbitrary URL/file execution
- context มีเฉพาะ facts ที่จำเป็นและ source-backed snippets
- ตรวจ output หลัง generation และ fail closed เมื่อ citation/route ไม่ตรง
- red-team direct/indirect prompt injection, data exfiltration และ denial-of-wallet ก่อนเปิดใช้
- ถ้า AI/offline/provider ล้มเหลว ให้ fallback เป็นรายการตรวจสอบใน browser โดยไม่ส่งซ้ำอัตโนมัติ

## Secrets และ deployment

- Secrets อยู่ใน Cloudflare Workers secrets/Supabase secret store ไม่ commit Git
- `.env.local` ใช้เฉพาะเครื่องนักพัฒนาและถูก ignore
- pin dependency versions ที่เกี่ยวกับ Supabase/OpenNext และ commit `package-lock.json`
- CI ใช้ `npm ci`, lint, typecheck, build, dependency audit, secret scan และ migration checks
- deploy จาก protected branch, review อย่างน้อย 1 คน; production schema/rules สำคัญ 2 คน

## Security headers caveat

starter ใช้ CSP ที่จำกัด origin แต่ยังมี `'unsafe-inline'` สำหรับ Next.js bootstrap/styles ในระยะต้น ก่อน production ให้เปลี่ยนเป็น nonce/hash CSP และทดสอบบน Cloudflare preview การมี CSP แบบนี้เป็น defense-in-depth ไม่ใช่เหตุให้ละเลย output encoding หรือ WAF

## Logging และเหตุการณ์

- ห้ามเปิด request-body logging ที่ Cloudflare, Next.js, Supabase หรือ AI provider
- sanitize exception, query parameters และ headers ก่อนส่ง error service
- แจ้งเตือนจาก error rate, latency, WAF blocks, DB auth failures และ rule publish events แบบ aggregate
- incident runbook: isolate AI routes → rotate secrets → freeze publishing → preserve non-content security logs → validate knowledge integrity → restore known-good version → notify ตามหน้าที่

## Verification checklist ก่อน pilot

- [ ] Refresh/ปิดหน้าแล้วเรื่องเล่าหาย และไม่มี browser storage/cookie
- [ ] Network inspection ยืนยันว่า textarea ไม่ถูกส่งก่อนผู้ใช้ยืนยัน
- [ ] Log inspection ยืนยันว่าไม่มี body/prompt/output
- [ ] Public key อ่านได้เฉพาะ published views และเขียนไม่ได้ทุกตาราง
- [ ] RLS tests ครอบคลุม draft/retired/expired rows
- [ ] WAF/rate limit/circuit breaker ผ่าน load test
- [ ] Prompt-injection และ XSS test ผ่าน
- [ ] Dependency/secret scan ไม่มี finding ระดับสูงที่ยอมรับไม่ได้
- [ ] Backup restore และ rollback rule version ผ่าน
