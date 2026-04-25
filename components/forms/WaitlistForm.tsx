"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type Status = "idle" | "loading" | "success" | "error";

type Props = {
  source?: string;
  variant?: "default" | "compact";
};

export function WaitlistForm({ source = "landing", variant = "default" }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      referral: String(formData.get("referral") ?? ""),
      website: String(formData.get("website") ?? ""),
      source,
    };

    try {
      const res = await fetch("/api/waitlist", {
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
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-emerald-100 dark:text-emerald-200">
        <p className="font-display text-lg">You're on the list.</p>
        <p className="mt-1 text-sm text-emerald-100/80">
          We'll send your invitation when Ciro opens in your city.
        </p>
      </div>
    );
  }

  const inline = variant === "compact";

  return (
    <form onSubmit={onSubmit} noValidate className={inline ? "flex flex-col gap-2 sm:flex-row" : "space-y-3"}>
      <div className={inline ? "flex-1" : ""}>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@somewhere.com"
          aria-label="Email address"
          error={status === "error" ? (error ?? undefined) : undefined}
        />
      </div>
      {!inline && (
        <Input
          name="referral"
          type="text"
          autoComplete="off"
          placeholder="Referral code (optional)"
          aria-label="Referral code"
        />
      )}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      <Button type="submit" disabled={status === "loading"} className={inline ? "sm:w-auto" : "w-full"}>
        {status === "loading" ? "Joining..." : "Get early access"}
      </Button>
      {status === "error" && error && !inline && (
        <p className="text-sm text-rose-400" role="alert">{error}</p>
      )}
    </form>
  );
}
