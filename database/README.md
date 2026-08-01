# Database entry point

`schema.sql` เป็น convenience entry point สำหรับ `psql` และอ้างถึง migration ที่เป็น source of truth ใน `supabase/migrations/`

อย่าแก้ schema โดยตรงที่ไฟล์นี้ ให้ใช้:

```powershell
npx supabase migration new ชื่อการเปลี่ยนแปลง
```

แล้วแก้ไฟล์ migration ที่ CLI สร้าง ทดสอบ `npm run db:reset` และ `npm run db:lint` ก่อน commit
