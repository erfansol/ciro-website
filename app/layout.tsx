import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Newsreader } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider, InitialThemeScript } from "@/components/providers/ThemeProvider";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/sections/Footer";
import { buildMetadata, organizationJsonLd, websiteJsonLd, SITE } from "@/lib/seo";

// Body + UI: Libre Franklin, a revival of Franklin Gothic — the sans of
// a century of American newsprint. Display: Newsreader, an editorial
// serif drawn for long-form journalism, with true italics.
const sans = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = buildMetadata({
  title: SITE.defaultTitle,
  description: SITE.description,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#faf7f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // GA4 measurement id (format G-XXXXXXXXXX). Set NEXT_PUBLIC_GA_ID in the
  // Hostinger env panel to enable; absent → analytics scripts are skipped
  // entirely so the site works with no tracking in dev/preview.
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable}`}
    >
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
        {/* Pins the document to light mode before paint so a returning
            visitor with a stale `dark` class doesn't flash. */}
        <InitialThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink-900 antialiased">
        <ThemeProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
