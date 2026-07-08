"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"summary" | "review" | null>(null);
  const [error, setError] = useState("");

  async function run(action: "summary" | "review") {
    setBusyAction(action);
    setError("");
    const path = action === "summary" ? "generate-summary" : "review";

    try {
      const response = await fetch(`/api/submissions/${id}/${path}`, { method: "POST" });
      if (!response.ok) throw new Error("Request failed");
      router.refresh();
    } catch {
      setError("Could not update this submission. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="mt-5 space-y-3">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="primary-button" disabled={busyAction !== null} onClick={() => run("summary")} type="button">
        {busyAction === "summary" ? "Generating..." : "Regenerate summary"}
      </button>
      <button className="secondary-button" disabled={busyAction !== null} onClick={() => run("review")} type="button">
        {busyAction === "review" ? "Marking..." : "Mark reviewed"}
      </button>
    </div>
  );
}
