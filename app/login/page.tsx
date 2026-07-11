import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(`/login?error=${encodeURIComponent("Email or password was not accepted")}&next=${encodeURIComponent(next)}`);
    }

    redirect(next);
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-rose-50 px-4 py-6 text-stone-900">
      <form action={login} className="w-full max-w-sm rounded-lg bg-white p-5 shadow-sm ring-1 ring-rose-100 sm:p-6">
        <p className="text-sm font-medium text-rose-700">Evelyn admin</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
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
