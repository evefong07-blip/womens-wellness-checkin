import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_EVELYN_EMAIL = "evefong07@gmail.com";

export function evelynAdminEmail() {
  return (process.env.EVELYN_ADMIN_EMAIL || process.env.NEXT_PUBLIC_EVELYN_ADMIN_EMAIL || DEFAULT_EVELYN_EMAIL)
    .trim()
    .toLowerCase();
}

export async function requireEvelynAdmin(supabase: SupabaseClient, next = "/admin") {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (user.email?.toLowerCase() !== evelynAdminEmail()) {
    redirect(`/login?error=${encodeURIComponent("This admin area is only for Evelyn")}&next=${encodeURIComponent(next)}`);
  }

  return user;
}

export async function isEvelynAdmin(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user?.email && user.email.toLowerCase() === evelynAdminEmail());
}
