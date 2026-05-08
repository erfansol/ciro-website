"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  dismissReportAction,
  resolveReportAction,
  type ReportActionResult,
} from "@/app/admin/moderation/actions";

export function ReportRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<"resolve" | "dismiss" | null>(null);
  const [notes, setNotes] = useState("");

  function handle(result: ReportActionResult) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setShowNotes(null);
    setNotes("");
    router.refresh();
  }

  function submit(action: "resolve" | "dismiss") {
    const fd = new FormData();
    fd.set("id", id);
    if (notes.trim()) fd.set("notes", notes.trim());
    startTransition(async () => {
      const fn = action === "resolve" ? resolveReportAction : dismissReportAction;
      handle(await fn(fd));
    });
  }

  if (showNotes) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional resolution note…"
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit(showNotes)}
            disabled={pending}
            className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/85 transition-colors hover:border-white/30 disabled:opacity-50"
          >
            {pending
              ? "Saving…"
              : showNotes === "resolve"
                ? "Confirm resolve"
                : "Confirm dismiss"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNotes(null);
              setNotes("");
              setError(null);
            }}
            className="text-[10px] uppercase tracking-[0.22em] text-white/45 hover:text-white/85"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="text-[11px] text-rose-300">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setShowNotes("resolve")}
        disabled={pending}
        className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-emerald-200 transition-colors hover:bg-emerald-400/[0.1] disabled:opacity-50"
      >
        Resolve
      </button>
      <button
        type="button"
        onClick={() => setShowNotes("dismiss")}
        disabled={pending}
        className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-white/30 disabled:opacity-50"
      >
        Dismiss
      </button>
      {error && (
        <p className="ml-2 text-[11px] text-rose-300">{error}</p>
      )}
    </div>
  );
}
