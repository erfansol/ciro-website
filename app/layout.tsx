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

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
      <body className="min-h-screen bg-white font-sans text-ink-900 antialiased">
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
