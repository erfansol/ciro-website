"use client";

import { useState, useTransition } from "react";
import { createStoryAction } from "./actions";
import type { StoryCategoryMeta } from "@/lib/categories";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toSlug(v: string): string {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewStoryForm({
  categories,
}: {
  categories: ReadonlyArray<StoryCategoryMeta>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [idValue, setIdValue] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const idValid = idValue.length > 0 && SLUG_RE.test(idValue);

  function onTitleChange(v: string) {
    setTitleValue(v);
    // Auto-fill the id from the title until the user touches the id field.
    if (!idTouched) {
      setIdValue(toSlug(v));
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createStoryAction(fd);
        // redirect() inside createStoryAction navigates away on success —
        // control flow doesn't continue here.
      } catch (err) {
        setError(err instanceof Error ? err.message : "Create failed.");
      }
    });
  }

  const inputCls =
    "mt-1.5 w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2.5 text-sm text-admin-text placeholder:text-admin-text-faint focus:border-admin-border-strong focus:outline-none";
  const labelCls =
    "block text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle";

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5">
      {/* ── Title ─────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="ns-title" className={labelCls}>
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="ns-title"
          name="title"
          type="text"
          required
          value={titleValue}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="The Night of the Forgotten Fountain"
          className={inputCls}
        />
      </div>

      {/* ── Story ID ──────────────────────────────────────────────── */}
      <div>
        <label htmlFor="ns-id" className={labelCls}>
          Story ID (slug) <span className="text-red-400">*</span>
        </label>
        <input
          id="ns-id"
          name="id"
          type="text"
          required
          value={idValue}
          onChange={(e) => {
            setIdValue(e.target.value);
            setIdTouched(true);
          }}
          placeholder="rome-colosseum"
          className={`${inputCls} font-mono ${idValue && !idValid ? "border-red-400/60" : ""}`}
        />
        <p className="mt-1 text-[11px] text-admin-text-faint">
          Lowercase letters, numbers, hyphens only. Used as the Firestore doc
          id and the Flutter story id — cannot be changed after creation.
          {idValue && !idValid && (
            <span className="ml-1 text-red-300">
              Invalid characters — fix before saving.
            </span>
          )}
        </p>
      </div>

      {/* ── City ──────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="ns-city" className={labelCls}>
          City <span className="text-red-400">*</span>
        </label>
        <input
          id="ns-city"
          name="city"
          type="text"
          required
          placeholder="Rome"
          className={inputCls}
        />
      </div>

      {/* ── Category ──────────────────────────────────────────────── */}
      <div>
        <label htmlFor="ns-category" className={labelCls}>
          Category
        </label>
        <select
          id="ns-category"
          name="category"
          defaultValue="historical"
          className={inputCls}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-md border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending || !idValid}
          className="rounded-md bg-admin-accent px-5 py-2.5 text-sm font-medium text-admin-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Creating…" : "Create story"}
        </button>
        <p className="text-[11px] text-admin-text-faint">
          Saves as a draft. You&apos;ll be taken to the editor to finish.
        </p>
      </div>
    </form>
  );
}
