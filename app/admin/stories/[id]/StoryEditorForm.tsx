"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveStoryAction, deleteStoryAction } from "./actions";
import type { AdminStory } from "@/lib/storyAdmin";
import type { StoryCategoryMeta } from "@/lib/categories";

export function StoryEditorForm({
  story,
  categories,
}: {
  story: AdminStory;
  categories: ReadonlyArray<StoryCategoryMeta>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await saveStoryAction(story.id, fd);
        setSavedAt(new Date().toLocaleTimeString());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  }

  function onDelete() {
    if (
      !confirm(
        `Delete "${story.title}" permanently? This cannot be undone, but the audit log keeps a copy.`,
      )
    )
      return;
    startTransition(async () => {
      try {
        await deleteStoryAction(story.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Field label="Title" name="title" defaultValue={story.title} required />
        <Field
          label="Description"
          name="description"
          defaultValue={story.description}
          textarea
          rows={6}
        />
        <Field label="City" name="city" defaultValue={story.city} required />
        <div>
          <Label>Category</Label>
          <select
            name="category"
            defaultValue={story.category}
            className="mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Duration label"
          name="durationLabel"
          defaultValue={story.durationLabel ?? ""}
          placeholder="e.g. 8 min"
        />
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Latitude"
            name="lat"
            defaultValue={story.lat?.toString() ?? ""}
            type="number"
            step="any"
          />
          <Field
            label="Longitude"
            name="lon"
            defaultValue={story.lon?.toString() ?? ""}
            type="number"
            step="any"
          />
        </div>
        <p className="text-[11px] text-white/40">
          Tip: open the World view to drag the pin instead of typing coordinates.
        </p>

        <label className="flex items-center gap-3 rounded-md border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={story.published}
            className="h-4 w-4 accent-emerald-400"
          />
          <span>
            <p className="text-sm text-white">Published on ciroai.com</p>
            <p className="text-xs text-white/45">
              Only published stories appear on the public website. The Flutter
              app keeps showing the doc independently.
            </p>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-[#06070d] transition-opacity hover:bg-white/90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-md border border-red-400/30 bg-red-400/[0.06] px-5 py-2.5 text-sm font-medium text-red-300 transition-colors hover:border-red-400/60 disabled:opacity-50"
          >
            Delete
          </button>
          {savedAt && !error && (
            <span className="text-xs text-emerald-300/80">Saved · {savedAt}</span>
          )}
          {error && <span className="text-xs text-red-300">{error}</span>}
        </div>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.22em] text-white/45">
      {children}
    </label>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  required,
  textarea,
  rows,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  step?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  const cls =
    "mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";
  return (
    <div>
      <Label>{label}</Label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={rows ?? 4}
          placeholder={placeholder}
          className={`${cls} font-mono text-[13px] leading-relaxed`}
        />
      ) : (
        <input
          name={name}
          type={type}
          step={step}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
