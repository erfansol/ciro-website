import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

// Same CDN-staleness guard as the other static pages (see about/page.tsx).
export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy · Ciro",
  description:
    "How the Ciro app and website collect, use, and protect your data (location, account details, voice, analytics and purchases) and the rights you have over it.",
  path: "/privacy",
});

const LAST_UPDATED = "30 September 2026";

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

export default function PrivacyPage() {
  return (
    <div className="relative pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-900/55 dark:text-white/45">
          Legal
        </p>
        <h1 className="mt-4 font-display text-balance text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.05] tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-900/70 sm:text-lg dark:text-white/65">
          This policy explains what the Ciro mobile app and this website
          collect, why, and the choices you have. Last updated{" "}
          {LAST_UPDATED}.
        </p>

        <Section title="Who we are">
          <p>
            Ciro is operated by Ciro, Rome, Italy (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;). We build a location-aware storytelling app
            that narrates the place you are standing in, with optional AR
            and an AI travel companion. For any privacy question or
            request, contact{" "}
            <a className="underline" href="mailto:support@ciroai.com">
              support@ciroai.com
            </a>
            .
          </p>
        </Section>

        <Section title="What we collect">
          <p>
            <strong>Account details.</strong> When you create an account we
            store your name, email address, and optional profile photo. You
            can also use the app as a guest without providing any of these.
          </p>
          <p>
            <strong>Location.</strong> With your permission, your device
            location is used to show nearby stories, anchor AR content to
            real places, ground the AI companion&rsquo;s answers in what is
            around you, and (if you enable it) notify you when you walk
            near a story. Location is used while you use those features;
            we do not sell location data or build advertising profiles
            from it.
          </p>
          <p>
            <strong>Camera and microphone.</strong> The camera feeds the AR
            view on your device. The microphone is used only during voice
            conversations, when your speech is streamed to our AI provider
            (Google) to generate a reply. Neither is recorded in the
            background.
          </p>
          <p>
            <strong>Usage and stability data.</strong> We use Firebase
            Analytics and Crashlytics to understand which features are used
            and to fix crashes. If you opt in to &ldquo;attention
            insights&rdquo;, we additionally collect anonymized,
            coarse-grained aggregates (approximate 50-metre tiles, never
            raw movement traces) that cannot be tied back to you.
          </p>
          <p>
            <strong>Purchases.</strong> Story tickets are processed by
            Apple&rsquo;s App Store or Google Play together with RevenueCat.
            We receive a record of what you own, never your payment card
            details.
          </p>
        </Section>

        <Section title="AI features">
          <p>
            The AI guide is powered by Google Gemini. Before your first
            message, the app asks for your permission and lists what is
            shared: what you type or say to the guide, your location and
            nearby places, and your name, language, and travel preferences.
            Google processes this to generate replies. We do not store your
            conversations, and we do not use them to train our own models.
          </p>
          <p>
            AI answers can be wrong. If you report a reply (long-press it in
            the app), we store that reply, the reason you chose, and any
            note you add, so our moderators can review it.
          </p>
        </Section>

        <Section title="Where your data lives">
          <p>
            App data is stored in Google Firebase (Firestore, Cloud
            Storage, Authentication) in Google Cloud data centres. Data is
            encrypted in transit. We keep it only as long as your account
            exists or as required by law.
          </p>
        </Section>

        <Section title="Your rights and choices">
          <p>
            You can access and correct your profile in the app, withdraw
            location, camera, microphone, or notification permissions in
            your device settings at any time, and opt out of attention
            insights in Settings.
          </p>
          <p>
            <strong>Deleting your account.</strong> Settings → Delete
            Account permanently removes your account, preferences, stats,
            tickets, and uploaded photos from our servers. If you are in
            the EU/EEA, you additionally have the GDPR rights of access,
            rectification, erasure, portability, and objection. Write to{" "}
            <a className="underline" href="mailto:support@ciroai.com">
              support@ciroai.com
            </a>{" "}
            to exercise them.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Ciro is not directed at children under 13 (or the equivalent
            minimum age in your country), and we do not knowingly collect
            their data.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes materially we will update this page and
            note the new date at the top.
          </p>
        </Section>
      </div>
    </div>
  );
}
