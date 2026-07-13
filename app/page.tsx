"use client";

import { useMemo, useState } from "react";
import type React from "react";
import {
  AGE_RANGES,
  CONCERNS,
  DURATIONS,
  buildWhatsappUrl,
  primaryConcern,
  validateCheckinPayload,
  type CheckinPayload,
  type CheckinSubmission,
} from "@/lib/checkin";

const initialForm: CheckinPayload = {
  name: "",
  age_range: "",
  whatsapp: "",
  concerns: [],
  duration: "",
  already_tried: "",
  wants_session: true,
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CheckinPayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submission, setSubmission] = useState<CheckinSubmission | null>(null);

  const stepTitle = ["About you", "Your main concerns", "How long", "What you have tried", "Next step"][step - 1];
  const progress = useMemo(() => `${step} of 5`, [step]);

  function update<K extends keyof CheckinPayload>(key: K, value: CheckinPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setApiError("");
  }

  function toggleConcern(concern: string) {
    const next = form.concerns.includes(concern)
      ? form.concerns.filter((item) => item !== concern)
      : [...form.concerns, concern];
    update("concerns", next);
  }

  function validateStep() {
    const allErrors = validateCheckinPayload(form);
    const fieldsByStep: Record<number, string[]> = {
      1: ["name", "age_range"],
      2: ["concerns"],
      3: ["duration"],
      4: ["whatsapp"],
      5: [],
    };
    const visibleErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([field]) => fieldsByStep[step].includes(field)),
    );
    setErrors(visibleErrors);
    return Object.keys(visibleErrors).length === 0;
  }

  function nextStep() {
    if (validateStep()) setStep((current) => Math.min(5, current + 1));
  }

  async function submit() {
    const allErrors = validateCheckinPayload(form);
    setErrors(allErrors);
    if (Object.keys(allErrors).length) {
      setStep(allErrors.name || allErrors.age_range ? 1 : allErrors.concerns ? 2 : allErrors.duration ? 3 : 4);
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || {});
        setApiError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSubmission(data.submission);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submission) {
    const summaryFocus = primaryConcern(submission.concerns);
    const alsoShared = submission.concerns.filter((concern) => concern !== summaryFocus);

    return (
      <main className="wellness-bg min-h-screen overflow-x-hidden px-4 py-5 text-stone-900 sm:py-8">
        <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-3xl flex-col justify-center">
          <div className="wellness-card p-5 sm:p-8">
            <p className="eyebrow">Saved successfully</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">Thank you, {submission.name}.</h1>
            <p className="mt-4 text-base leading-7 text-stone-700 sm:text-lg">{submission.summary_text}</p>

            <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-semibold text-stone-900">Your check-in snapshot</p>
              <div className="mt-3 grid gap-3 text-sm text-stone-700 sm:grid-cols-3">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Summary focus</span>
                  <span className="mt-1 block font-semibold text-stone-900">{summaryFocus}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Duration</span>
                  <span className="mt-1 block font-semibold text-stone-900">{submission.duration}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Selected concerns</span>
                  <span className="mt-1 block font-semibold text-stone-900">{submission.concerns.length}</span>
                </div>
              </div>
              {alsoShared.length > 0 && (
                <p className="mt-4 text-sm leading-6 text-stone-700">
                  <span className="font-semibold text-stone-900">Also selected:</span> {alsoShared.join(", ")}
                </p>
              )}
            </div>

            <a
              className="whatsapp-button mt-6"
              href={buildWhatsappUrl(submission)}
              rel="noreferrer"
              target="_blank"
            >
              Continue to WhatsApp to contact Evelyn
            </a>
            <button
              className="mt-3 min-h-12 w-full rounded-md border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700"
              onClick={() => {
                setSubmission(null);
                setForm(initialForm);
                setStep(1);
              }}
              type="button"
            >
              Start another check-in
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="wellness-bg min-h-screen overflow-x-hidden px-4 py-5 text-stone-900 sm:py-8">
      <section className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-rose-100 bg-white/70 p-5 shadow-sm sm:p-6">
          <p className="eyebrow">Women's Wellness Check-In</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Tell Evelyn what has been happening.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-700">
            A calm five-step check-in for women 40+ in Singapore. No login needed, no pressure, just a clearer starting point.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-stone-700 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-rose-100 bg-white p-4">
              <p className="font-semibold text-stone-900">2 minutes</p>
              <p className="mt-1">Share what feels most noticeable today.</p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-white p-4">
              <p className="font-semibold text-stone-900">Gentle summary</p>
              <p className="mt-1">Get warm next-step guidance instantly.</p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-white p-4">
              <p className="font-semibold text-stone-900">WhatsApp Evelyn</p>
              <p className="mt-1">Start the conversation only when ready.</p>
            </div>
          </div>
        </div>

        <div className="wellness-card p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{progress}</p>
              <h2 className="mt-1 text-xl font-semibold">{stepTitle}</h2>
            </div>
            <div className="mt-3 h-2 w-24 shrink-0 rounded-full bg-rose-100 sm:w-28">
              <div className="h-2 rounded-full bg-rose-600" style={{ width: `${(step / 5) * 100}%` }} />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Name" error={errors.name}>
                <input
                  className="field"
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Your name"
                  value={form.name}
                />
              </Field>
              <Field label="Age range" error={errors.age_range}>
                <select className="field" onChange={(event) => update("age_range", event.target.value)} value={form.age_range}>
                  <option value="">Choose one</option>
                  {AGE_RANGES.map((age) => (
                    <option key={age}>{age}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <Field label="Select all that feel true today" error={errors.concerns}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CONCERNS.map((concern) => (
                  <label className="choice" key={concern}>
                    <input
                      checked={form.concerns.includes(concern)}
                      className="h-4 w-4 accent-rose-700"
                      onChange={() => toggleConcern(concern)}
                      type="checkbox"
                    />
                    <span>{concern}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}

          {step === 3 && (
            <Field label="How long has this been happening?" error={errors.duration}>
              <div className="space-y-3">
                {DURATIONS.map((duration) => (
                  <label className="choice" key={duration}>
                    <input
                      checked={form.duration === duration}
                      className="h-4 w-4 accent-rose-700"
                      onChange={() => update("duration", duration)}
                      type="radio"
                    />
                    <span>{duration}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Field label="WhatsApp number" error={errors.whatsapp}>
                <input
                  className="field"
                  inputMode="tel"
                  onChange={(event) => update("whatsapp", event.target.value)}
                  placeholder="+65 9111 2222"
                  value={form.whatsapp}
                />
              </Field>
              <Field label="What have you already tried?">
                <textarea
                  className="field min-h-28 resize-none"
                  onChange={(event) => update("already_tried", event.target.value)}
                  placeholder="For example: vitamins, yoga, cutting caffeine..."
                  value={form.already_tried || ""}
                />
              </Field>
            </div>
          )}

          {step === 5 && (
            <Field label="Would you like a free Body Clarity Session?">
              <div className="space-y-3">
                <label className="choice">
                  <input
                    checked={form.wants_session}
                    className="h-4 w-4 accent-rose-700"
                    onChange={() => update("wants_session", true)}
                    type="radio"
                  />
                  <span>Yes, I would love a free session</span>
                </label>
                <label className="choice">
                  <input
                    checked={!form.wants_session}
                    className="h-4 w-4 accent-rose-700"
                    onChange={() => update("wants_session", false)}
                    type="radio"
                  />
                  <span>Not yet</span>
                </label>
              </div>
            </Field>
          )}

          {apiError && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{apiError}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {step > 1 && (
              <button className="secondary-button" onClick={() => setStep((current) => current - 1)} type="button">
                Back
              </button>
            )}
            {step < 5 ? (
              <button className="primary-button" onClick={nextStep} type="button">
                Next
              </button>
            ) : (
              <button className="primary-button" disabled={isSubmitting} onClick={submit} type="button">
                {isSubmitting ? "Saving..." : "Submit check-in"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-800">{label}</span>
      {children}
      {error && <span className="mt-2 block text-sm text-red-700">{error}</span>}
    </label>
  );
}
