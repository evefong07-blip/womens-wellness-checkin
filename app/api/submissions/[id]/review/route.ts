import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    const { data: before } = await supabase.from("checkin_submissions").select("*").eq("id", id).single();
    const { data: after, error } = await supabase
      .from("checkin_submissions")
      .update({ summary_review_status: "reviewed" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: "Could not mark reviewed" }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      action: "mark_reviewed",
      submission_id: id,
      actor: "evelyn",
      before_state: before,
      after_state: after,
    });

    return NextResponse.json({ submission: after });
  } catch {
    return NextResponse.json({ message: "Could not mark reviewed" }, { status: 500 });
  }
}
