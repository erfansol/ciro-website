"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  platform: "ios" | "android";
  url: string;
  sizeBytes: number;
  sha256: string;
  version: number;
};

/**
 * Upload a Unity AssetBundle for a story. The server computes the
 * checksum, bumps the version and writes the `gs://` URL into the story,
 * so nothing is pasted by hand.
 */
export function BundleUploader({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.set("storyId", storyId);
      fd.set("platform", platform);
      fd.set("file", file);
      const res = await fetch("/api/admin/bundles/upload", { method: "POST", body: fd });
      const json = (await res.json()) as ({ ok: true } & Result) | { ok: false; error: string };
      if (!json.ok) throw new Error(json.error);
      setResult(json);
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-md border border-dashed border-admin-border-strong p-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
        Upload a new bundle
      </p>
      <p className="mt-1 text-xs text-admin-text-subtle">
        Built with <code>BuildPipeline.BuildAssetBundles</code> for this platform. The checksum, size, URL and version are filled in for you; installed copies re-download on the new version.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as "ios" | "android")}
          className="rounded-md border border-admin-border bg-admin-surface px-2 py-1.5 text-xs text-admin-text"
        >
          <option value="ios">iOS</option>
          <option value="android">Android</option>
        </select>
        <input
          type="file"
          accept=".bundle,application/octet-stream"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-xs text-admin-text-muted file:mr-3 file:rounded-md file:border file:border-admin-border file:bg-admin-surface file:px-3 file:py-1.5 file:text-xs file:text-admin-text"
        />
        <button
          type="button"
          onClick={upload}
          disabled={!file || busy}
          className="rounded-md bg-admin-accent px-4 py-1.5 text-xs font-medium text-admin-accent-fg disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>
      {result && (
        <p className="mt-2 text-xs text-emerald-300">
          v{result.version} · {(result.sizeBytes / 1024 / 1024).toFixed(1)} MB · sha256 {result.sha256.slice(0, 12)}… → {result.url}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
