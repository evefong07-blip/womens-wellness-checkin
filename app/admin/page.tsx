import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { primaryConcern, type CheckinSubmission } from "@/lib/checkin";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ selected?: string; wants?: string }>;
}) {
  const params = await searchParams;
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  let query = authClient.from("checkin_submissions").select("*").order("created_at", { ascending: false });
  if (params.wants === "yes") query = query.eq("wants_session", true);
  const { data, error } = await query;
  const submissions = (data || []) as CheckinSubmission[];
  const selected = submissions.find((item) => item.id === params.selected) || submissions[0] || null;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-stone-900">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-rose-700">Evelyn admin</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Wellness check-ins</h1>
          </div>
          <div className="flex gap-2">
            <Link className="secondary-button max-w-none" href="/admin">
              Show all
            </Link>
            <Link className="primary-button max-w-none" href="/admin?wants=yes">
              Wants session
            </Link>
          </div>
        </div>

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">Could not load submissions.</p>}

        {!submissions.length ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
            <p className="font-medium">No submissions yet</p>
            <p className="mt-2 text-sm text-stone-600">Share your check-in link to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-stone-200">
              <div className="grid grid-cols-[1fr_1fr_0.8fr] gap-3 border-b border-stone-200 bg-stone-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-600 sm:grid-cols-[1fr_1fr_0.8fr_0.8fr]">
                <span>Name</span>
                <span>Top concern</span>
                <span>Session</span>
                <span className="hidden sm:block">Date</span>
              </div>
              {submissions.map((submission) => (
                <Link
                  className={`grid grid-cols-[1fr_1fr_0.8fr] gap-3 border-b border-stone-100 px-4 py-4 text-sm transition hover:bg-rose-50 sm:grid-cols-[1fr_1fr_0.8fr_0.8fr] ${
                    selected?.id === submission.id ? "bg-rose-50" : ""
                  }`}
                  href={`/admin?${new URLSearchParams({
                    ...(params.wants === "yes" ? { wants: "yes" } : {}),
                    selected: submission.id,
                  })}`}
                  key={submission.id}
                >
                  <span className="font-medium">{submission.name}</span>
                  <span>{primaryConcern(submission.concerns)}</span>
                  <span>{submission.wants_session ? "Yes" : "Not yet"}</span>
                  <span className="hidden sm:block">{new Date(submission.created_at).toLocaleDateString("en-SG")}</span>
                </Link>
              ))}
            </div>

            {selected && (
              <aside className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selected.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">{selected.age_range} | {selected.whatsapp}</p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                    {selected.summary_review_status}
                  </span>
                </div>

                <dl className="mt-5 space-y-4 text-sm">
                  <Detail label="Concerns" value={selected.concerns.join(", ")} />
                  <Detail label="Duration" value={selected.duration} />
                  <Detail label="Already tried" value={selected.already_tried || "Not shared"} />
                  <Detail label="Wants session" value={selected.wants_session ? "Yes" : "Not yet"} />
                  <Detail label="Readiness score" value={selected.readiness_score == null ? "Not computed" : String(selected.readiness_score)} />
                  <Detail label="Summary source" value={selected.summary_source || "None"} />
                </dl>

                <div className="mt-5 rounded-lg bg-stone-50 p-4">
                  <p className="text-sm font-semibold">Summary</p>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{selected.summary_text || "No summary yet."}</p>
                </div>

                <ReviewActions id={selected.id} />
              </aside>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-stone-800">{label}</dt>
      <dd className="mt-1 text-stone-600">{value}</dd>
    </div>
  );
}
