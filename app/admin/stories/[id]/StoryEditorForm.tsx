"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveStoryAction, deleteStoryAction } from "./actions";
import type { AdminStory } from "@/lib/storyAdmin";
import type { StoryCategoryMeta } from "@/lib/categories";

type PublishMode = "draft" | "published" | "scheduled";

function initialMode(story: AdminStory): PublishMode {
  if (story.published) return "published";
  if (story.publishAt) return "scheduled";
  return "draft";
}

// HTML <input type="datetime-local"> wants `YYYY-MM-DDTHH:mm` in the
// user's local zone. We store ISO UTC; convert on the way in/out so
// the operator sees a wall-clock time matching their browser.
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
  const [mode, setMode] = useState<PublishMode>(initialMode(story));
  const [publishAtInput, setPublishAtInput] = useState<string>(
    isoToLocalInput(story.publishAt),
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("publishMode", mode);
    if (mode === "scheduled") {
      if (!publishAtInput) {
        setError("Pick a publish time, or switch to Draft / Published.");
        return;
      }
      // datetime-local is local time without TZ; convert to ISO via Date.
      const iso = new Date(publishAtInput).toISOString();
      fd.set("publishAt", iso);
    } else {
      fd.set("publishAt", "");
    }
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
            className="mt-1.5 w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2.5 text-sm  text-admin-text focus:border-admin-border-strong focus:outline-none"
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
        <p className="text-[11px] text-admin-text-subtle">
          Tip: open the World view to drag the pin instead of typing coordinates.
        </p>

        <fieldset className="rounded-md border border-admin-border bg-admin-surface p-4">
          <legend className="px-1 text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
            Publish status
          </legend>
          <div className="space-y-2 pt-1">
            <PublishOption
              checked={mode === "draft"}
              onChange={() => setMode("draft")}
              label="Draft"
              hint="Hidden from ciroai.com. Visible only to admins."
            />
            <PublishOption
              checked={mode === "published"}
              onChange={() => setMode("published")}
              label="Published"
              hint="Live on ciroai.com immediately."
            />
            <PublishOption
              checked={mode === "scheduled"}
              onChange={() => setMode("scheduled")}
              label="Schedule for later"
              hint="Stays a draft until the time below — then auto-flips to published."
            />
            {mode === "scheduled" && (
              <div className="ml-7 mt-2">
                <input
                  type="datetime-local"
                  value={publishAtInput}
                  onChange={(e) => setPublishAtInput(e.target.value)}
                  className="rounded-md border border-admin-border bg-admin-surface-strong px-3 py-2 text-sm text-admin-text focus:border-admin-border-strong focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-admin-text-faint">
                  Times are interpreted in your browser&rsquo;s local zone.
                  Auto-publish runs every time an admin loads /admin/stories.
                </p>
              </div>
            )}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-admin-accent px-5 py-2.5 text-sm font-medium text-admin-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
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
    <label className="block text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
      {children}
    </label>
  );
}

function PublishOption({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="radio"
        name="publishMode"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-admin-accent"
      />
      <span className="block">
        <span className="block text-sm text-admin-text">{label}</span>
        <span className="block text-xs text-admin-text-subtle">{hint}</span>
      </span>
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
    "mt-1.5 w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2.5 text-sm  text-admin-text placeholder:text-admin-text-faint focus:border-admin-border-strong focus:outline-none";
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
