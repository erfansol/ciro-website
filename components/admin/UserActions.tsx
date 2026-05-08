"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  restoreUserAction,
  setRoleAction,
  suspendUserAction,
  type ActionResult,
} from "@/app/admin/users/[uid]/actions";

type Role = "admin" | "moderator" | "editor";

export function UserActions({
  uid,
  email,
  disabled,
  role,
  isSelf,
}: {
  uid: string;
  email: string | null;
  disabled: boolean;
  role: Role | null;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [draftRole, setDraftRole] = useState<Role | "">(role ?? "");

  function handle(result: ActionResult) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  function onSuspend() {
    if (!confirm(`Suspend ${email ?? uid}? They will be unable to sign in.`)) return;
    const fd = new FormData();
    fd.set("uid", uid);
    if (reason.trim()) fd.set("reason", reason.trim());
    startTransition(async () => handle(await suspendUserAction(fd)));
  }

  function onRestore() {
    if (!confirm(`Restore ${email ?? uid}? Sign-in will be re-enabled.`)) return;
    const fd = new FormData();
    fd.set("uid", uid);
    startTransition(async () => handle(await restoreUserAction(fd)));
  }

  function onRoleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (draftRole === (role ?? "")) return;
    if (
      draftRole &&
      !confirm(`Grant role "${draftRole}" to ${email ?? uid}?`)
    )
      return;
    if (
      !draftRole &&
      role &&
      !confirm(`Revoke "${role}" role from ${email ?? uid}?`)
    )
      return;
    const fd = new FormData();
    fd.set("uid", uid);
    fd.set("role", draftRole);
    startTransition(async () => handle(await setRoleAction(fd)));
  }

  return (
    <div className="space-y-6">
      {/* Suspend / Restore */}
      <section className="rounded-md border border-admin-border bg-admin-surface p-5">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
          Sign-in access
        </h2>
        <p className="mt-2 text-sm text-admin-text-muted">
          {disabled
            ? "This account is suspended — Firebase Auth refuses sign-in."
            : "Account is active. You can suspend to block sign-in immediately."}
        </p>

        {!disabled && (
          <div className="mt-3">
            <label className="block text-[10px] uppercase tracking-[0.22em] text-admin-text-subtle">
              Suspension reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. spam reports, policy violation"
              className="mt-1.5 w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm  text-admin-text placeholder:text-admin-text-faint focus:border-admin-border-strong focus:outline-none"
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          {disabled ? (
            <button
              type="button"
              onClick={onRestore}
              disabled={pending || isSelf}
              className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-2 text-xs uppercase tracking-[0.22em] text-emerald-200 transition-colors hover:bg-emerald-400/[0.1] disabled:opacity-50"
            >
              {pending ? "Working…" : "Restore"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSuspend}
              disabled={pending || isSelf}
              className="rounded-md border border-rose-400/30 bg-rose-400/[0.06] px-4 py-2 text-xs uppercase tracking-[0.22em] text-rose-200 transition-colors hover:bg-rose-400/[0.1] disabled:opacity-50"
            >
              {pending ? "Working…" : "Suspend"}
            </button>
          )}
          {isSelf && (
            <span className="text-[11px] text-admin-text-subtle">
              You can&rsquo;t suspend your own account.
            </span>
          )}
        </div>
      </section>

      {/* Role */}
      <section className="rounded-md border border-admin-border bg-admin-surface p-5">
        <h2 className="text-[11px] uppercase tracking-[0.22em] text-admin-text-subtle">
          Admin role
        </h2>
        <p className="mt-2 text-sm text-admin-text-muted">
          Roles in <code className="text-admin-text-muted">roles/&#123;uid&#125;</code>{" "}
          gate access to <code className="text-admin-text-muted">/admin</code>. None
          means no admin access at all.
        </p>

        <form onSubmit={onRoleSubmit} className="mt-3 flex items-center gap-3">
          <select
            value={draftRole}
            onChange={(e) => setDraftRole(e.target.value as Role | "")}
            disabled={pending || isSelf}
            className="rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm  text-admin-text focus:border-admin-border-strong focus:outline-none disabled:opacity-50"
          >
            <option value="">— none —</option>
            <option value="editor">editor</option>
            <option value="moderator">moderator</option>
            <option value="admin">admin</option>
          </select>
          <button
            type="submit"
            disabled={pending || isSelf || draftRole === (role ?? "")}
            className="rounded-md border border-admin-border bg-admin-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-admin-text-muted transition-colors hover:border-admin-border-strong hover:text-admin-text disabled:opacity-50"
          >
            {pending ? "Saving…" : "Apply"}
          </button>
          {isSelf && (
            <span className="text-[11px] text-admin-text-subtle">
              Use another admin to change your own role.
            </span>
          )}
        </form>
      </section>

      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/[0.06] px-4 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}
