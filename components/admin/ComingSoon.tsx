/**
 * Placeholder for admin pages that exist in the navigation but whose
 * implementation lives in Phases 2+. Keeps the sidebar shape stable so
 * URLs don't 404 while the foundation rolls out.
 */
export function ComingSoon({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <div className="px-8 py-8 lg:px-12">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/40">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-white">
          {title}
        </h1>
      </header>

      <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
          Phase 2+
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
          {description}
        </p>
      </div>
    </div>
  );
}
