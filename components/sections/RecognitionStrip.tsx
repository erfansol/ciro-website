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

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-900/75 dark:border-white/15 dark:text-white/75">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
            iOS · TestFlight pre-release
          </span>
          <a
            href="mailto:info@ciroai.com?subject=Ciro%20investor%20enquiry"
            className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-900/75 transition-colors hover:border-ink-900/40 hover:text-ink-900 dark:border-white/15 dark:text-white/75 dark:hover:border-white/40 dark:hover:text-white"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-amber-500"
            />
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
