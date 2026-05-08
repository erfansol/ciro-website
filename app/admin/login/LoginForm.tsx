"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { signInAction } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const auth = getFirebaseAuth();
      // Browser session persistence: the ID token only lives in this
      // tab. The server-managed session cookie is the durable handle.
      await setPersistence(auth, browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken(true);

      const fd = new FormData();
      fd.set("idToken", idToken);
      const result = await signInAction(null, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Sign-in failed. Try again.";
      // Firebase error codes are noisy; show only the human bit.
      const cleaned = msg
        .replace(/^Firebase: /, "")
        .replace(/\s*\(auth\/[^)]+\)\.?$/, "")
        .trim();
      setError(cleaned || "Sign-in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2.5 text-sm  text-admin-text placeholder:text-admin-text-faint focus:border-admin-border-strong focus:outline-none"
          placeholder="you@ciroai.com"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2.5 text-sm  text-admin-text focus:border-admin-border-strong focus:outline-none"
        />
      </div>
      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/[0.06] px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !email || !password}
        className="w-full rounded-md bg-admin-accent px-4 py-2.5 text-sm font-medium text-admin-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
