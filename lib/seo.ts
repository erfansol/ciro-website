import type { Metadata } from "next";

export const SITE = {
  name: "Ciro",
  legalName: "Ciro Travel",
  founder: "Erfan Soleymanzadeh",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ciroai.com",
  defaultTitle: "Ciro — Experience cities through AI-powered stories",
  description:
    "Ciro is an AI-powered travel app by Erfan Soleymanzadeh that turns every city into a living story. Personalized routes, location-based narratives, and AR experiences across Rome, Milan, Paris, and Barcelona.",
  keywords: [
    "AI travel app",
    "AR city exploration",
    "interactive tourism app",
    "things to do in Rome",
    "hidden places in cities",
    "personalized travel guide",
    "audio tours",
    "AR tourism",
    "Rome AR tour",
    "Milan travel app",
    "Erfan Soleymanzadeh",
    "Ciro app",
  ],
  twitter: "@ciro_travel",
  locale: "en_US",
};

export const buildMetadata = ({
  title,
  description,
  path = "/",
  image = "/opengraph-image",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata => {
  const url = `${SITE.url}${path}`;
  const fullTitle = title === SITE.defaultTitle ? title : `${title} · ${SITE.name}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    keywords: SITE.keywords,
    authors: [{ name: SITE.founder, url: SITE.url }],
    creator: SITE.founder,
    publisher: SITE.legalName,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url,
      title: fullTitle,
      description,
      siteName: SITE.name,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
      images: [image],
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    manifest: "/manifest.webmanifest",
  };
};

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.legalName,
  alternateName: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo.svg`,
  founder: {
    "@type": "Person",
    name: SITE.founder,
  },
  sameAs: [
    "https://twitter.com/ciro_travel",
    "https://www.instagram.com/ciro.travel",
    "https://www.linkedin.com/company/ciro-travel",
  ],
});

export const softwareAppJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: SITE.name,
  operatingSystem: "iOS, Android",
  applicationCategory: "TravelApplication",
  description: SITE.description,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1280" },
});

export const cityJsonLd = ({
  name,
  country,
  description,
  url,
  image,
}: {
  name: string;
  country: string;
  description: string;
  url: string;
  image: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name,
  description,
  url,
  image,
  containedInPlace: { "@type": "Country", name: country },
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/stories?q={query}`,
    "query-input": "required name=query",
  },
});
