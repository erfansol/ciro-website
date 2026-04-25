"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type Status = "idle" | "loading" | "success" | "error";

export function NotifyMeForm({ citySlug, cityName }: { citySlug: string; cityName: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? ""),
      citySlug,
      website: String(fd.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-emerald-300">
        We'll email you the moment {cityName} goes live.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2 sm:flex-row">
      <Input
        name="email"
        type="email"
        required
        autoComplete="email"
        aria-label={`Email for ${cityName} launch notification`}
        placeholder="Your email"
        className="flex-1"
        error={status === "error" ? (error ?? undefined) : undefined}
      />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <Button type="submit" size="md" disabled={status === "loading"}>
        {status === "loading" ? "..." : `Notify me`}
      </Button>
    </form>
  );
}
