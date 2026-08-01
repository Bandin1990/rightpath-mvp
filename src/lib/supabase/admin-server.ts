import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type AdminRole = "editor" | "reviewer" | "publisher" | "admin";

export function isAdminRole(value: unknown): value is AdminRole {
  return value === "editor" || value === "reviewer" || value === "publisher" || value === "admin";
}

export async function createAdminServerClient() {
  const env = getSupabaseConfig();
  if (!env) throw new Error("supabase_not_configured");

  const cookieStore = await cookies();

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. src/proxy.ts refreshes them.
        }
      },
    },
  });
}

export async function requireAdminUser(allowedRoles: AdminRole[] = ["editor", "reviewer", "publisher", "admin"]) {
  const supabase = await createAdminServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role;

  if (error || !user) throw new Error("not_authenticated");
  if (!isAdminRole(role) || !allowedRoles.includes(role)) throw new Error("not_authorized");

  return { supabase, user, role };
}
