import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSummary } from "@/lib/summary-ai";
import { normalizeWhatsapp, validateCheckinPayload, type CheckinPayload } from "@/lib/checkin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload: CheckinPayload = {
      name: String(body.name || "").trim(),
      age_range: String(body.age_range || ""),
      whatsapp: normalizeWhatsapp(String(body.whatsapp || "")),
      concerns: Array.isArray(body.concerns) ? body.concerns.map(String) : [],
      duration: String(body.duration || ""),
      already_tried: String(body.already_tried || "").trim() || null,
      wants_session: Boolean(body.wants_session),
    };

    const errors = validateCheckinPayload(payload);
    if (Object.keys(errors).length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const supabase = await createClient();
    const summary = await generateSummary(payload);
    const now = new Date().toISOString();
    const submission = {
      id: crypto.randomUUID(),
      created_at: now,
      ...payload,
      summary_text: summary.summary_text,
      summary_source: summary.summary_source,
      summary_confidence: summary.summary_confidence,
      summary_review_status: "unreviewed",
      readiness_score: summary.readiness_score,
    };

    const { error } = await supabase
      .from("checkin_submissions")
      .insert(submission);

    if (error) {
      return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      action: "submission_created",
      submission_id: submission.id,
      actor: "system",
      before_state: null,
      after_state: submission,
    });

    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
