import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const existing = await getCurrentAdmin().catch(() => null);
  if (existing) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt=""
            width={28}
            height={28}
            priority
            className="h-7 w-7 rounded-md"
          />
          <span className="font-display text-[14px] font-medium tracking-[0.22em] text-admin-text">
            CIRO
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-faint">
            admin
          </span>
        </div>

        <h1 className="font-display text-2xl tracking-tight text-admin-text">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-admin-text-muted">
          Use the Firebase account that was granted an admin role.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
