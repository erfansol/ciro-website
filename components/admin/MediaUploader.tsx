"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "uploading" | "error";

const MAX_BYTES = 100 * 1024 * 1024;

export function MediaUploader({ storyId }: { storyId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
    currentName: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function uploadOne(file: File) {
    if (file.size > MAX_BYTES) {
      throw new Error(`${file.name} is over the 100 MB limit.`);
    }
    const fd = new FormData();
    fd.set("storyId", storyId);
    fd.set("file", file);
    const res = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(data.error ?? `Upload failed (${res.status})`);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setStatus("uploading");
    setError(null);
    setProgress({ completed: 0, total: list.length, currentName: list[0].name });
    try {
      for (let i = 0; i < list.length; i++) {
        setProgress({
          completed: i,
          total: list.length,
          currentName: list[i].name,
        });
        await uploadOne(list[i]);
      }
      setStatus("idle");
      setProgress(null);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setStatus("error");
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={
          "flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center transition-colors " +
          (dragOver
            ? "border-white/40 bg-white/[0.04]"
            : "border-white/10 bg-white/[0.02]")
        }
      >
        <p className="text-sm text-white/70">
          {status === "uploading"
            ? `Uploading ${progress?.currentName ?? "…"} (${(progress?.completed ?? 0) + 1}/${progress?.total ?? 1})`
            : "Drop files here, or click to browse"}
        </p>
        <p className="mt-1 text-[11px] text-white/40">
          Max 100 MB per file. Stored at{" "}
          <code className="text-white/55">stories/{storyId}/&lt;filename&gt;</code>.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="mt-4 rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/85 transition-colors hover:border-white/30 disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : "Choose files"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>
      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/[0.06] px-4 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}
