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
        <label className="block text-[11px] uppercase tracking-[0.22em] text-white/45">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          placeholder="you@ciroai.com"
        />
      </div>
      <div>
        <label className="block text-[11px] uppercase tracking-[0.22em] text-white/45">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
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
        className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-medium text-[#06070d] transition-opacity hover:bg-white/90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
