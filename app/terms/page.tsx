import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

// Same CDN-staleness guard as the other static pages (see about/page.tsx).
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service · Ciro",
  description:
    "The terms that govern your use of the Ciro app and website: accounts, purchases, acceptable use, safety while walking, and liability.",
  path: "/terms",
});

const LAST_UPDATED = "24 August 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 max-w-3xl space-y-4 text-base leading-relaxed text-ink-900/75 dark:text-white/70">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          Legal
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          These terms govern your use of the Ciro app and website. By
          creating an account or using the app you agree to them. Last
          updated {LAST_UPDATED}.
        </p>

        <Section title="The service">
          <p>
            Ciro provides location-anchored stories, AR experiences, and an
            AI travel companion. Story availability varies by city and may
            change over time. AI-generated content can be inaccurate, so
            treat it as a companion&rsquo;s suggestion, not professional
            advice.
          </p>
        </Section>

        <Section title="Stay aware of your surroundings">
          <p>
            Ciro is designed to be used while walking in public spaces.
            Always watch where you are going, obey traffic signals and
            local rules, and never use the app while driving or cycling.
            You are responsible for your own safety; do not enter unsafe or
            restricted areas to follow a story.
          </p>
        </Section>

        <Section title="Accounts">
          <p>
            You must provide accurate information and keep your credentials
            secure. You can delete your account at any time in Settings; see our{" "}
            <a className="underline" href="/privacy">
              Privacy Policy
            </a>{" "}
            for what deletion covers. We may suspend accounts that abuse
            the service or break these terms.
          </p>
        </Section>

        <Section title="Purchases">
          <p>
            Story tickets are one-time purchases processed by Apple&rsquo;s
            App Store or Google Play. Prices are shown before you buy.
            Purchases can be restored on a new device with the same store
            account. Refunds are handled by the store under its own rules.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Don&rsquo;t misuse the service: no reverse engineering,
            scraping, reselling story content, harassing other users in
            group sessions, or using the AI features to generate unlawful
            content. Story audio, text, and AR assets are licensed to you
            for personal use only.
          </p>
        </Section>

        <Section title="Liability">
          <p>
            The service is provided &ldquo;as is&rdquo;. To the maximum
            extent permitted by law, Ciro is not liable for indirect or
            consequential damages, and our total liability is limited to
            the amount you paid us in the twelve months before the claim.
            Nothing in these terms limits liability that cannot be limited
            by law.
          </p>
        </Section>

        <Section title="Changes and contact">
          <p>
            We may update these terms; material changes will be announced
            in the app or on this page. Questions? Contact{" "}
            <a className="underline" href="mailto:support@ciroai.com">
              support@ciroai.com
            </a>
            . These terms are governed by Italian law.
          </p>
        </Section>
      </div>
    </div>
  );
}
