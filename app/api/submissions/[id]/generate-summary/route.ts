import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSummary } from "@/lib/summary-ai";
import { isEvelynAdmin } from "@/lib/admin-auth";
import type { CheckinPayload } from "@/lib/checkin";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    if (!(await isEvelynAdmin(supabase))) {
      return NextResponse.json({ message: "Please sign in as Evelyn" }, { status: 401 });
    }

    const { data: before, error: fetchError } = await supabase
      .from("checkin_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !before) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    const payload: CheckinPayload = {
      name: before.name,
      age_range: before.age_range,
      whatsapp: before.whatsapp,
      concerns: before.concerns || [],
      duration: before.duration,
      already_tried: before.already_tried,
      wants_session: before.wants_session,
    };
    const summary = await generateSummary(payload);

    const { data: after, error: updateError } = await supabase
      .from("checkin_submissions")
      .update({
        summary_text: summary.summary_text,
        summary_source: summary.summary_source,
        summary_confidence: summary.summary_confidence,
        summary_review_status: "unreviewed",
        readiness_score: summary.readiness_score,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ message: "Could not update summary" }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      action: "generate_summary",
      submission_id: id,
      actor: "system",
      before_state: before,
      after_state: after,
    });

    return NextResponse.json({ submission: after });
  } catch {
    return NextResponse.json({ message: "Could not generate summary" }, { status: 500 });
  }
}
