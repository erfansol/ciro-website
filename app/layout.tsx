import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider, InitialThemeScript } from "@/components/providers/ThemeProvider";
import { Nav } from "@/components/ui/Nav";
import { CursorAura } from "@/components/ui/CursorAura";
import { Footer } from "@/components/sections/Footer";
import { buildMetadata, organizationJsonLd, websiteJsonLd, SITE } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = buildMetadata({
  title: SITE.defaultTitle,
  description: SITE.description,
  path: "/",
});

// Theme color is set from CSS once the boot script has decided which
// palette to use; we send a sensible static default for the first paint.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#06070d" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable}`}
    >
      <head>
        {/* Picks light or dark before hydration based on local time
            (or a saved preference). Must run before the body so the
            first paint matches the chosen theme. */}
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
      <body className="min-h-screen bg-white font-sans text-ink-900 antialiased dark:bg-[#06070d] dark:text-white">
        <ThemeProvider>
          <CursorAura />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
