"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Input";

type Status = "idle" | "loading" | "success" | "error";

const ROLES = [
  { value: "investor", label: "Investor" },
  { value: "partner", label: "Partner / Brand" },
  { value: "creator", label: "Creator / Storyteller" },
  { value: "other", label: "Other" },
];

export function PartnershipForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      role: String(fd.get("role") ?? "investor"),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/partnership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setErrors((prev) => ({ ...prev, _global: err instanceof Error ? err.message : "Something went wrong" }));
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-emerald-100">
        <p className="font-display text-xl">Thank you.</p>
        <p className="mt-2 text-sm text-emerald-100/80">
          A founder will be in touch within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Your name" required autoComplete="name" placeholder="Ada Lovelace" error={errors.name} />
        <Input name="email" label="Email" type="email" required autoComplete="email" placeholder="ada@firm.vc" error={errors.email} />
      </div>
      <Select name="role" label="I am a..." defaultValue="investor" options={ROLES} error={errors.role} />
      <Textarea
        name="message"
        label="Message (optional)"
        placeholder="Investment thesis, partnership idea, or what you'd like to build with us."
        error={errors.message}
      />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      {errors._global && (
        <p className="text-sm text-rose-400" role="alert">{errors._global}</p>
      )}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Invest / Partner with Ciro"}
      </Button>
    </form>
  );
}
