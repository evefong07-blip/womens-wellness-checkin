import { createClient } from "@/lib/supabase/server";
import { requireEvelynAdmin } from "@/lib/admin-auth";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  await requireEvelynAdmin(supabase);

  return <AdminShell>{children}</AdminShell>;
}
