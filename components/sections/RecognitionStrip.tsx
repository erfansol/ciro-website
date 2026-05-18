import Link from "next/link";
import { RECOGNITION_BY_DATE } from "@/lib/recognition";

/**
 * Compact "recognized by" strip mounted on the homepage just under the
 * hero. Flat wordmarks only (no third-party logo art) — keeps things ATS
 * / Google-reviewer scannable without copyright-claim risk on logos that
 * aren't ours. The full /press page has the long-form details.
 */
export function RecognitionStrip() {
  const items = RECOGNITION_BY_DATE;

  return (
    <section
      aria-label="Recognition"
      className="relative border-y border-ink-900/10 bg-white py-10 dark:border-white/10 dark:bg-[#06070d]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/45 dark:text-white/40">
          Recognized by
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-center sm:grid-cols-3 lg:grid-cols-5">
          {items.map((r) => (
            <li key={r.id}>
              <span className="block text-[13px] font-medium tracking-tight text-ink-900/85 dark:text-white/85">
                {r.short}
              </span>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-ink-900/45 dark:text-white/40">
                {r.date} · {r.location.split(",")[0]}
              </span>
            </li>
          ))}
        </ul>

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
