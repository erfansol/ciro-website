import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const existing = await getCurrentAdmin().catch(() => null);
  if (existing) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06070d] p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[#FFD54F]" />
          </span>
          <span className="font-display text-[14px] font-medium tracking-[0.22em] text-white/85">
            CIRO
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            admin
          </span>
        </div>

        <h1 className="font-display text-2xl tracking-tight text-white">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Use the Firebase account that was granted an admin role.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
