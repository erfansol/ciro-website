"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  applyImportAction,
  previewImportAction,
  type ImportApplyResult,
  type ImportPreviewResult,
} from "@/app/admin/stories/import/actions";
import type { ImportPlan } from "@/lib/storyAdmin";

export function StoryImporter() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [appliedSummary, setAppliedSummary] =
    useState<{ created: number; updated: number; invalid: number } | null>(
      null,
    );
  const [error, setError] = useState<string | null>(null);

  function preview() {
    setError(null);
    setAppliedSummary(null);
    const fd = new FormData();
    fd.set("payload", text);
    startTransition(async () => {
      const res: ImportPreviewResult = await previewImportAction(fd);
      if (!res.ok) {
        setPlan(null);
        setError(res.error);
        return;
      }
      setPlan(res.plan);
    });
  }

  function apply() {
    if (!plan) return;
    if (
      !confirm(
        `Apply import? Will create ${plan.toCreate.length} and update ${plan.toUpdate.length} stories. Cannot be undone.`,
      )
    )
      return;
    setError(null);
    const fd = new FormData();
    fd.set("payload", text);
    startTransition(async () => {
      const res: ImportApplyResult = await applyImportAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setAppliedSummary({
        created: res.result.createdIds.length,
        updated: res.result.updatedIds.length,
        invalid: res.result.invalid.length,
      });
      setPlan(null);
      setText("");
      router.refresh();
    });
  }

  async function handleFile(f: File) {
    try {
      const t = await f.text();
      setText(t);
      setPlan(null);
      setError(null);
    } catch {
      setError("Could not read file.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-admin-border bg-admin-surface p-4">
        <p className="text-sm text-admin-text-muted">
          Paste the JSON payload or upload a file exported from{" "}
          <code className="text-admin-text">/api/admin/stories/export</code>.
          Each entry must include <code className="text-admin-text">id</code>,
          <code className="text-admin-text">title</code>,
          <code className="text-admin-text">city</code>, and
          <code className="text-admin-text">category</code>.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-admin-border-strong bg-admin-surface-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text"
          >
            Upload file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.currentTarget.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => {
              setText("");
              setPlan(null);
              setError(null);
              setAppliedSummary(null);
            }}
            className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle transition-colors hover:text-admin-text"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPlan(null);
        }}
        rows={14}
        spellCheck={false}
        placeholder='[{"id":"my-story","title":"…","city":"Rome","category":"historical", …}]'
        className="w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2.5 font-mono text-[12px] leading-relaxed text-admin-text placeholder:text-admin-text-faint focus:border-admin-border-strong focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={preview}
          disabled={pending || text.trim().length === 0}
          className="rounded-md border border-admin-border-strong bg-admin-surface-2 px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-text transition-colors hover:border-admin-border-strong disabled:opacity-50"
        >
          {pending ? "Working…" : "Preview"}
        </button>
        <button
          type="button"
          onClick={apply}
          disabled={pending || !plan}
          className="rounded-md bg-admin-accent px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Importing…" : "Apply"}
        </button>
        {error && <span className="text-xs text-rose-300">{error}</span>}
        {appliedSummary && (
          <span className="text-xs text-emerald-300">
            ✓ Imported · created {appliedSummary.created}, updated{" "}
            {appliedSummary.updated}
            {appliedSummary.invalid > 0 &&
              ` · ${appliedSummary.invalid} invalid skipped`}
          </span>
        )}
      </div>

      {plan && (
        <div className="grid gap-4 lg:grid-cols-3">
          <PlanColumn title={`Create (${plan.toCreate.length})`} rows={plan.toCreate.map(r => ({ key: r.id, label: r.title, secondary: r.id }))} emptyText="—" tone="emerald" />
          <PlanColumn title={`Update (${plan.toUpdate.length})`} rows={plan.toUpdate.map(r => ({ key: r.id, label: r.title, secondary: r.id }))} emptyText="—" tone="sky" />
          <PlanColumn
            title={`Invalid (${plan.invalid.length})`}
            rows={plan.invalid.map(r => ({ key: String(r.index), label: `Entry ${r.index}`, secondary: r.reason }))}
            emptyText="—"
            tone="rose"
          />
        </div>
      )}
    </div>
  );
}

function PlanColumn({
  title,
  rows,
  emptyText,
  tone,
}: {
  title: string;
  rows: Array<{ key: string; label: string; secondary: string }>;
  emptyText: string;
  tone: "emerald" | "sky" | "rose";
}) {
  const border =
    tone === "emerald"
      ? "border-emerald-400/30"
      : tone === "sky"
        ? "border-sky-400/30"
        : "border-rose-400/30";
  return (
    <section
      className={`rounded-md border ${border} bg-admin-surface p-4`}
    >
      <h3 className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-xs text-admin-text-faint">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-sm">
          {rows.map((r) => (
            <li key={r.key}>
              <p className="truncate text-admin-text">{r.label}</p>
              <p className="truncate text-[11px] text-admin-text-faint">
                {r.secondary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
