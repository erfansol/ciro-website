"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteMediaAction,
  type MediaActionResult,
} from "@/app/admin/stories/[id]/media/actions";

export function MediaDeleteButton({
  storyId,
  filename,
}: {
  storyId: string;
  filename: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle(result: MediaActionResult) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  function onDelete() {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("storyId", storyId);
    fd.set("filename", filename);
    startTransition(async () => handle(await deleteMediaAction(fd)));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="rounded-md border border-rose-400/30 bg-rose-400/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-rose-200 transition-colors hover:bg-rose-400/[0.1] disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="text-[11px] text-rose-300">{error}</span>}
    </div>
  );
}

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          window.prompt("Copy this URL:", url);
        }
      }}
      className="rounded-md border border-admin-border bg-admin-surface px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text"
    >
      {copied ? "Copied" : "Copy URL"}
    </button>
  );
}
