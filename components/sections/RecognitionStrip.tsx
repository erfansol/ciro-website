import Link from "next/link";
import { RECOGNITION_BY_DATE } from "@/lib/recognition";

/**
 * "Recognized by" strip mounted on the homepage just under the hero.
 * Each entry is a small card that hovers and links into /press so a
 * visitor can verify it. The grid is sized to the actual number of
 * recognitions — no empty cells.
 *
 * Two status pills below carry the live product/funding state.
 */
export function RecognitionStrip() {
  const items = RECOGNITION_BY_DATE;

  // Static class mapping — Tailwind JIT needs literal strings, not
  // template-built ones.
  const colsByCount: Record<number, string> = {
    1: "grid-cols-1 sm:grid-cols-1 lg:grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  const colsClass = colsByCount[Math.min(items.length, 4)] ?? colsByCount[4];

  return (
    <section
      aria-label="Recognition"
      className="relative border-y border-ink-900/10 bg-white py-12 dark:border-white/10 dark:bg-[#06070d]"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/45 dark:text-white/40">
          Recognized by
        </p>

        <ul className={`mt-8 grid gap-3 ${colsClass}`}>
          {items.map((r) => (
            <li key={r.id}>
              <Link
                href={r.verifyUrl ?? "/press"}
                target={r.verifyUrl ? "_blank" : undefined}
                rel={r.verifyUrl ? "noopener noreferrer" : undefined}
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-ink-900/10 bg-white px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-900/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/30 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-900/45 dark:text-white/40">
                  {r.date}
                </span>
                <span className="block text-[13px] font-medium leading-snug tracking-tight text-ink-900/90 dark:text-white/90">
                  {r.short}
                </span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-ink-900/55 dark:text-white/45">
                  {r.location.split(",")[0]}{" "}
                  <span
                    aria-hidden
                    className="inline-block translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-900/75 dark:border-white/15 dark:text-white/75">
            <PulseDot color="emerald" />
            iOS · TestFlight pre-release
          </span>
          <a
            href="mailto:info@ciroai.com?subject=Ciro%20investor%20enquiry"
            className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-900/75 transition-colors hover:border-ink-900/40 hover:text-ink-900 dark:border-white/15 dark:text-white/75 dark:hover:border-white/40 dark:hover:text-white"
          >
            <PulseDot color="amber" />
            Currently raising · info@ciroai.com
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-ink-900/55 dark:text-white/45">
          <Link
            href="/press"
            className="underline-offset-4 transition-colors hover:text-ink-900 hover:underline dark:hover:text-white"
          >
            Read the full press &amp; recognition →
          </Link>
        </p>
      </div>
    </section>
  );
}

function PulseDot({ color }: { color: "emerald" | "amber" }) {
  const bg = color === "emerald" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <span aria-hidden className="relative inline-flex h-1.5 w-1.5">
      <span
        className={`absolute inset-0 animate-ping rounded-full ${bg} opacity-60`}
      />
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${bg}`} />
    </span>
  );
}
