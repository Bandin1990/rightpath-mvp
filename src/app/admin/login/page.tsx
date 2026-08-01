import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/admin/actions";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { getSupabaseConfig } from "@/lib/supabase/config";

const errorMessages: Record<string, string> = {
  "not-configured": "ยังไม่ได้เชื่อมต่อ Supabase กรุณาตั้งค่าระบบก่อนเข้าสู่ระบบ",
  "invalid-form": "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
  "invalid-credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configured = Boolean(getSupabaseConfig());
  const params = await searchParams;

  if (configured) {
    const supabase = await createAdminServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/admin");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-[1180px] items-center gap-12 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <section>
        <Link href="/" className="text-sm font-bold text-river underline underline-offset-4">
          ← กลับหน้าประชาชน
        </Link>
        <p className="mt-12 text-sm font-bold tracking-[0.14em] text-river">ระบบหลังบ้าน</p>
        <h1 className="mt-4 max-w-[12ch] text-5xl font-bold leading-[1.2] tracking-[-0.04em] text-ink sm:text-6xl">
          ดูแลความรู้<br />ก่อนนำทางคน
        </h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-ink-soft">
          พื้นที่สำหรับผู้แก้ไข ผู้ตรวจทาน และผู้เผยแพร่ข้อมูลภัยเร่งด่วน หน่วยงาน ช่องทางติดต่อ และกฎจับคู่คำ
        </p>
      </section>

      <section className="border-t-8 border-river bg-white p-6 shadow-[12px_12px_0_#cbd8d9] sm:p-10">
        <p className="text-sm font-bold text-river">เข้าสู่ระบบผู้ดูแล</p>
        <h2 className="mt-2 text-3xl font-bold text-ink">ใช้บัญชีเจ้าหน้าที่เท่านั้น</h2>

        {!configured && (
          <div className="mt-6 border-l-4 border-saffron bg-[#fff8e8] p-4 text-sm leading-6 text-ink">
            <strong className="block">ระบบหลังบ้านพร้อมแล้ว แต่ยังไม่ได้เชื่อมฐานข้อมูล</strong>
            ตั้งค่า SUPABASE_URL และ SUPABASE_PUBLISHABLE_KEY แล้วใช้ migration ล่าสุดก่อนเข้าสู่ระบบ
          </div>
        )}

        {params.error && errorMessages[params.error] && (
          <p role="alert" className="mt-6 border-l-4 border-coral bg-[#fff0ed] p-4 text-sm text-ink">
            {errorMessages[params.error]}
          </p>
        )}

        <form action={signInAction} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-bold text-ink">
            อีเมลเจ้าหน้าที่
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              disabled={!configured}
              className="min-h-12 border border-line bg-paper px-4 text-base font-normal focus:border-river focus:outline-none disabled:opacity-60"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            รหัสผ่าน
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
              disabled={!configured}
              className="min-h-12 border border-line bg-paper px-4 text-base font-normal focus:border-river focus:outline-none disabled:opacity-60"
            />
          </label>
          <button type="submit" disabled={!configured} className="min-h-12 bg-ink px-5 py-3 font-bold text-white hover:bg-river disabled:cursor-not-allowed disabled:opacity-50">
            เข้าสู่ระบบหลังบ้าน
          </button>
        </form>
        <p className="mt-6 text-xs leading-5 text-ink-soft">
          ระบบใช้บทบาทจาก Supabase app_metadata เท่านั้น และไม่ใช้ข้อมูลที่ผู้ใช้แก้ไขเองเป็นตัวกำหนดสิทธิ
        </p>
      </section>
    </main>
  );
}
