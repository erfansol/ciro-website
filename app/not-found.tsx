import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80vh] items-center justify-center overflow-hidden bg-aurora text-white">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">404</p>
        <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
          This street isn't on Ciro yet.
        </h1>
        <p className="mt-6 text-base text-white/70 leading-relaxed">
          We're mapping cities one chapter at a time. Try heading back to the main route.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <Link href="/stories" className="text-sm font-medium text-white/70 underline-offset-4 hover:underline self-center">
            Browse stories →
          </Link>
        </div>
      </div>
    </section>
  );
}
