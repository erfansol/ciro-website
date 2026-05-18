import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { RECOGNITION_BY_DATE } from "@/lib/recognition";

export const metadata: Metadata = buildMetadata({
  title: "Press & recognition · Ciro",
  description:
    "Ciro has been recognized at Maker Faire Rome 2024, the European Digital Education Hub conference at Spazio Europa, Sapienza Università di Roma (M.Des. thesis 2024), and selected as a finalist in Startcup Lazio 2025.",
  path: "/press",
});

const kindLabel: Record<string, string> = {
  award: "Award",
  competition: "Competition",
  academic: "Academic",
  event: "Event",
  grant: "Grant",
};

export default function PressPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          Press & recognition
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          What people have said about Ciro, with receipts.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          Independent recognition from European institutions, universities,
          competitions, and public field tests. Every item below links to the
          source where one is publicly available.
        </p>

        <ul className="mt-16 space-y-6">
          {RECOGNITION_BY_DATE.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-ink-900/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02] sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <span className="rounded-full border border-ink-900/15 px-3 py-1 text-ink-900/70 dark:border-white/15 dark:text-white/65">
                  {kindLabel[r.kind] ?? r.kind}
                </span>
                <span className="text-ink-900/45 dark:text-white/40">
                  {r.date}
                </span>
                <span className="text-ink-900/45 dark:text-white/40">
                  · {r.location}
                </span>
              </div>

              <h2 className="mt-4 font-display text-xl tracking-tight sm:text-2xl">
                {r.title}
              </h2>
              <p className="mt-1 text-sm text-ink-900/55 dark:text-white/55">
                {r.issuer}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-ink-900/75 dark:text-white/70">
                {r.body}
              </p>

              {r.verifyUrl && (
                <p className="mt-4 text-xs">
                  <a
                    href={r.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium uppercase tracking-[0.18em] text-ink-900/70 underline-offset-4 hover:text-ink-900 hover:underline dark:text-white/70 dark:hover:text-white"
                  >
                    Verify on {r.verifyLabel ?? "source"} →
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>

        <section className="mt-16 rounded-2xl border border-ink-900/10 bg-white p-8 dark:border-white/10 dark:bg-white/[0.02]">
          <h2 className="font-display text-2xl tracking-tight">
            For journalists
          </h2>
          <p className="mt-3 text-sm text-ink-900/70 dark:text-white/65">
            High-resolution logos, screenshots, founder bio, and the EDEH
            Certificate of Appreciation (PDF, signed by Prof.ssa Ida Cortoni,
            Sapienza) are available on request.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:press@ciroai.com?subject=Ciro%20press%20kit"
              className="inline-flex items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-900/90 dark:bg-white dark:text-[#06070d] dark:hover:bg-white/90"
            >
              press@ciroai.com
            </a>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-ink-900/15 bg-white/60 px-6 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-white dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Read the company page
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
