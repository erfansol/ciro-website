import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

// Same CDN-staleness guard as the other static pages (see about/page.tsx).
export const revalidate = 300;

// App Store Connect's required Support URL points here, and the app's
// support email (lib/core/constants/app_links.dart) must match below.
export const metadata: Metadata = buildMetadata({
  title: "Support · Ciro",
  description:
    "Get help with the Ciro app: contact us, manage location and story alerts, the AI guide, purchases, and deleting your account.",
  path: "/support",
});

const SUPPORT_EMAIL = "support@ciroai.com";

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

export default function SupportPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          Help
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          Support
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          Something not working, or a question about a story? Write to{" "}
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>{" "}
          and tell us which device you use and what happened. We read every
          message.
        </p>

        <Section title="A story won't start">
          <p>
            Stories download their content the first time you play them, so
            you need an internet connection for that first start. Make sure
            Ciro is allowed to use your location (iPhone Settings → Ciro →
            Location) and, for AR scenes, your camera.
          </p>
        </Section>

        <Section title="Location and story alerts">
          <p>
            Ciro can tell you when you walk near a story. Turn this on or off
            in the app under Settings → Stories nearby. The alert needs
            location access set to &ldquo;Always&rdquo;; you can change that
            at any time in iPhone Settings → Ciro → Location.
          </p>
        </Section>

        <Section title="The AI guide">
          <p>
            The guide is powered by Google Gemini and can make mistakes, so
            double-check anything important such as opening hours. If a
            reply is wrong or inappropriate, long-press it and choose Report.
          </p>
        </Section>

        <Section title="Purchases and refunds">
          <p>
            Stories are bought through the App Store. If you reinstall the
            app or change phones, sign in with the same account and your
            stories come back. If one is still missing, open it, tap the
            buy button, and choose Restore Purchases. Refunds are handled by
            Apple: request one at{" "}
            <a
              className="underline"
              href="https://reportaproblem.apple.com"
              rel="noopener noreferrer"
            >
              reportaproblem.apple.com
            </a>
            .
          </p>
        </Section>

        <Section title="Reporting a story">
          <p>
            If a story is inaccurate, broken, or inappropriate, open it and
            tap Report. A moderator will review it.
          </p>
        </Section>

        <Section title="Deleting your account">
          <p>
            In the app, go to Settings → Delete Account. This permanently
            removes your account and its data from our servers. See the{" "}
            <Link className="underline" href="/privacy">
              Privacy Policy
            </Link>{" "}
            for details, and the{" "}
            <Link className="underline" href="/terms">
              Terms of Service
            </Link>{" "}
            for the rules of use.
          </p>
        </Section>
      </div>
    </div>
  );
}
