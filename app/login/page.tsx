import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { evelynAdminEmail } from "@/lib/admin-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  async function login(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const next = String(formData.get("next") || "/admin");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(`/login?error=${encodeURIComponent("Email or password was not accepted")}&next=${encodeURIComponent(next)}`);
    }

    if (data.user?.email?.toLowerCase() !== evelynAdminEmail()) {
      await supabase.auth.signOut();
      redirect(`/login?error=${encodeURIComponent("This admin area is only for Evelyn")}&next=${encodeURIComponent(next)}`);
    }

    redirect(next);
  }

  return (
    <main className="wellness-bg flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-6 text-stone-900">
      <form action={login} className="wellness-card w-full max-w-sm p-5 sm:p-6">
        <p className="eyebrow">Evelyn admin</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in to review check-ins</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">This dashboard is private and only available to Evelyn.</p>
        <input name="next" type="hidden" value={params.next || "/admin"} />
        {params.error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">Email</span>
          <input className="field" name="email" required type="email" />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold">Password</span>
          <input className="field" name="password" required type="password" />
        </label>
        <button className="primary-button mt-6" type="submit">
          Sign in
        </button>
      </form>
    </main>
  );
}
