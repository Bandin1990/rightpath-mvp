# Cloudflare deployment & security baseline

ค่าจริงขึ้นกับ Cloudflare plan และปริมาณผู้ใช้ ให้เริ่มแบบ conservative แล้วปรับจาก aggregate traffic โดยไม่เก็บเนื้อหา

## Workers/OpenNext

- Deploy ผ่าน `npm run deploy`
- ตั้ง `SUPABASE_URL` และ `SUPABASE_PUBLISHABLE_KEY` ด้วย Wrangler secrets
- ห้ามตั้ง AI key หรือ database secret ใน `vars`/Git
- เปิด metrics แต่ปิด invocation logs; โค้ดห้าม log request body
- ใช้ custom domain ที่ proxied ผ่าน Cloudflare เท่านั้น

## Managed protection

- DDoS managed rules: เปิดค่ามาตรฐานที่ Cloudflare แนะนำ
- WAF managed rules: เปิด Cloudflare Managed + OWASP ruleset และ rollout จาก log/challenge ก่อน block หากกลัว false positive
- Bot controls: challenge เฉพาะ traffic ผิดปกติ ไม่บังคับผู้ใช้ทุกคน
- Cache: knowledge GET 1 ชั่วโมงที่ edge พร้อม stale-while-revalidate; หน้า static cache ตาม build

## Rate-limit policy ตั้งต้น

| Path | Method | ต่อ IP/1 นาที | Action |
|---|---:|---:|---|
| `/api/knowledge/*` | GET | 60 | Managed challenge แล้ว block |
| `/api/analyze` | POST | 5 | Block 10 นาที |
| `/api/generate` | POST | 3 | Block 10 นาที |
| `/api/*` body > 32 KB | POST | — | Block |
| method อื่นบน `/api/knowledge/*` | non-GET | — | Block |

สำหรับ NAT/ชุมชนที่ใช้ IP ร่วม ให้ทดสอบ false positive และใช้ counting characteristics ที่ plan รองรับ เช่น IP + path + trusted session token แบบไม่ persistent

## Custom rules intent

1. Block methods ที่ endpoint ไม่รองรับ
2. Block oversized bodies ก่อนถึง Worker/AI
3. Challenge known automated/bot anomalies
4. Rate-limit expensive endpoints แยกจาก static/knowledge
5. Emergency switch: block `/api/analyze` และ `/api/generate` แต่ไม่ block `/`, `/api/health`, read-only knowledge

อย่าใส่ค่า secret หรือเนื้อหา request ลง rule expressions/response headers

## Circuit breaker

- ค่า config ฝั่ง Worker ปิด AI endpoint ได้ทันที
- budget รายชั่วโมง/วันสำหรับ calls/tokens
- timeout ต่อ provider และ retry สูงสุด 1 ครั้งเฉพาะ idempotent failure
- เมื่อเปิดวงจร ตอบคำแนะนำพื้นฐานจาก published rules และเสนอ human assistance

## Verification

- Preview deploy ผ่าน `npm run preview`
- ตรวจ security headers และ CSP ใน browser
- ยิง load จาก environment ที่ได้รับอนุญาตเพื่อยืนยัน limit/action
- ยืนยัน Worker/Supabase/AI logs ไม่มี body/prompt/output
- ทดสอบ direct Supabase Data API: anon อ่านเฉพาะ `api` published views และเขียนไม่ได้
- ทดสอบ AI-off mode ว่าหน้าข้อมูลพื้นฐานยังใช้ได้

บันทึก rule IDs, owner, วันที่ทดสอบ และ rollback action ในระบบจัดการ configuration ขององค์กร
