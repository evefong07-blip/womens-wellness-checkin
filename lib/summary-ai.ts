import { buildRuleBasedSummary, computeReadinessScore, type CheckinPayload } from "@/lib/checkin";

export type SummaryResult = {
  summary_text: string;
  summary_source: "rule_based" | "openai_gpt4o";
  summary_confidence: number | null;
  readiness_score: number;
};

export async function generateSummary(payload: CheckinPayload): Promise<SummaryResult> {
  const readiness_score = computeReadinessScore(payload);
  const fallback: SummaryResult = {
    summary_text: buildRuleBasedSummary(payload),
    summary_source: "rule_based",
    summary_confidence: null,
    readiness_score,
  };

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "Write a warm, safe, non-medical wellness check-in summary for a woman aged 40+ in Singapore. Do not diagnose. Keep it to 2-3 sentences and suggest a gentle next conversation with Evelyn.",
          },
          {
            role: "user",
            content: JSON.stringify({
              name: payload.name,
              age_range: payload.age_range,
              concerns: payload.concerns,
              duration: payload.duration,
              already_tried: payload.already_tried,
              wants_session: payload.wants_session,
            }),
          },
        ],
      }),
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const summary = data?.choices?.[0]?.message?.content?.trim();

    if (!summary) return fallback;

    return {
      summary_text: summary,
      summary_source: "openai_gpt4o",
      summary_confidence: 0.86,
      readiness_score,
    };
  } catch {
    return fallback;
  }
}
