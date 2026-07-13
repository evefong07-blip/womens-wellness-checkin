export const AGE_RANGES = ["40-44", "45-49", "50-54", "55-59", "60+"] as const;

export const CONCERNS = [
  "Fatigue",
  "Bloating",
  "Feeling cold",
  "Stress",
  "Sleep issues",
  "Monthly discomfort",
  "Body has changed",
  "Other",
] as const;

export const DURATIONS = [
  "Less than 1 month",
  "1-3 months",
  "3-6 months",
  "More than 6 months",
] as const;

export type CheckinPayload = {
  name: string;
  age_range: string;
  whatsapp: string;
  concerns: string[];
  duration: string;
  already_tried: string | null;
  wants_session: boolean;
};

export type CheckinSubmission = CheckinPayload & {
  id: string;
  created_at: string;
  user_id?: string | null;
  summary_text: string | null;
  summary_source: string | null;
  summary_confidence: number | null;
  summary_review_status: "unreviewed" | "reviewed" | "edited";
  readiness_score?: number | null;
};

const concernCopy: Record<string, string> = {
  Fatigue:
    "Feeling tired for this long can be frustrating, especially when you are still carrying so much for everyone else. This is worth looking at gently instead of pushing through.",
  Bloating:
    "Bloating can make you feel uncomfortable and disconnected from your body. The pattern you shared gives Evelyn a helpful starting point for a calmer conversation.",
  "Feeling cold":
    "Feeling cold often feels easy to dismiss, but together with your other signs it is a useful clue. Your body may be asking for more support, not more willpower.",
  Stress:
    "Stress can quietly affect sleep, digestion, mood, and energy. Naming it clearly is a strong first step toward feeling more steady again.",
  "Sleep issues":
    "Poor sleep can make every other concern feel louder. Your answers suggest this deserves kind, practical attention rather than another quick fix.",
  "Monthly discomfort":
    "Monthly discomfort can change over time, and it is valid to want answers. Your check-in gives Evelyn a clear picture of what has been happening.",
  "Body has changed":
    "Body changes can feel confusing when they arrive without a clear reason. You do not have to figure the pattern out alone.",
  Other:
    "You have noticed something important enough to pause and ask for support. That awareness is a helpful starting point for the next conversation.",
};

export function normalizeWhatsapp(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }
  if (digits.startsWith("65")) {
    return `+${digits}`;
  }
  return `+65${digits}`;
}

export function validateCheckinPayload(payload: CheckinPayload) {
  const errors: Record<string, string> = {};
  const whatsappDigits = payload.whatsapp.replace(/[^\d]/g, "");

  if (!payload.name.trim()) errors.name = "Please enter your name";
  if (!AGE_RANGES.includes(payload.age_range as (typeof AGE_RANGES)[number])) {
    errors.age_range = "Please choose your age range";
  }
  if (!payload.concerns.length) errors.concerns = "Please select at least one concern";
  if (!DURATIONS.includes(payload.duration as (typeof DURATIONS)[number])) {
    errors.duration = "Please choose how long this has been happening";
  }
  if (whatsappDigits.length < 8) errors.whatsapp = "Please enter a valid WhatsApp number";

  return errors;
}

export function primaryConcern(concerns: string[]) {
  return concerns[0] || "your main concern";
}

export function computeReadinessScore(payload: Pick<CheckinPayload, "wants_session" | "duration" | "concerns" | "already_tried">) {
  let score = 0;
  if (payload.wants_session) score += 0.4;
  if (payload.duration === "More than 6 months") score += 0.3;
  if (payload.concerns.length >= 3) score += 0.2;
  if (payload.already_tried?.trim()) score += 0.1;
  return Math.min(1, Number(score.toFixed(2)));
}

export function buildRuleBasedSummary(payload: Pick<CheckinPayload, "name" | "concerns" | "duration" | "already_tried" | "wants_session">) {
  const firstName = payload.name.trim().split(/\s+/)[0] || payload.name.trim();
  const concern = primaryConcern(payload.concerns);
  const baseCopy = concernCopy[concern] || concernCopy.Other;
  const concernIntro =
    payload.concerns.length > 1
      ? `you shared ${payload.concerns.length} concerns, including ${concern.toLowerCase()}`
      : `you shared ${concern.toLowerCase()}`;
  const tried = payload.already_tried?.trim()
    ? `You have already tried ${payload.already_tried.trim()}, so the next step can be more targeted.`
    : "You do not need to have tried everything before asking for support.";
  const session = payload.wants_session
    ? "A free Body Clarity Session is a gentle next step to make sense of these signals."
    : "You can keep this summary and reach out when the timing feels right.";

  return `${firstName}, ${concernIntro} and you have been noticing this for ${payload.duration.toLowerCase()}. ${baseCopy} ${tried} ${session}`;
}

export function buildWhatsappUrl(payload: Pick<CheckinPayload, "name" | "concerns">, evelynNumber?: string) {
  const number = (evelynNumber || process.env.NEXT_PUBLIC_EVELYN_WHATSAPP || process.env.EVELYN_WHATSAPP_NUMBER || "6580208895").replace(/[^\d]/g, "");
  const concernText =
    payload.concerns.length > 1
      ? `I selected ${payload.concerns.length} concerns, including ${primaryConcern(payload.concerns)}`
      : `my concern is ${primaryConcern(payload.concerns)}`;
  const text = `Hi Evelyn, I just completed the wellness check-in. My name is ${payload.name.trim()} and ${concernText}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
