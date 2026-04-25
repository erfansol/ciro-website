# Ciro Website — ciroai.com

Production-ready marketing site for **Ciro** — an AI-powered tourism platform and mobile app founded by **Erfan Soleymanzadeh**. Cinematic storytelling, AR experiences, and personalized city journeys across Rome, Milan, Paris, and Barcelona.

> **Deploying to Hostinger?** See [`DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md) for the recommended Git-based deployment workflow.

## Stack

- **Next.js 15** (App Router, RSC, dynamic OG image)
- **TypeScript** strict mode
- **TailwindCSS 3** with a custom design system (sunset gradient, aurora dark theme)
- **Framer Motion** for scroll-driven reveals (respects `prefers-reduced-motion`)
- **next-themes** for dark/light toggle
- **Zod** for input validation
- File-system mock backend out-of-the-box, **Firebase Admin** ready behind an env flag

## Quick start

```bash
cd website
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing — hero, what/how, cities, waitlist, investor, vision |
| `/stories` | Pinterest-style grid of cinematic story cards |
| `/city/[slug]` | SEO-optimized city pages (Rome, Milan, Paris, Barcelona) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Auto-generated |

## Email backend

By default, all submissions (`/api/waitlist`, `/api/partnership`, `/api/notify`) are written to `data/submissions.json` (gitignored). Submissions are validated via Zod, rate-limited per IP (5/min), and protected with a hidden honeypot field.

To switch to Firebase Firestore:

1. `npm install firebase-admin`
2. Set in `.env.local`:
   ```
   EMAIL_BACKEND=firebase
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ```
3. Submissions land in `ciro_waitlist`, `ciro_partnership`, `ciro_notify` collections.

## SEO

- Per-page `<title>`, `<meta description>`, canonical, OpenGraph, Twitter card via `lib/seo.ts`
- Structured data: `Organization`, `WebSite`, `MobileApplication`, `TouristDestination`
- `app/sitemap.ts` + `app/robots.ts` (auto-served at `/sitemap.xml` and `/robots.txt`)
- Dynamic OG image at `/opengraph-image` (Edge runtime)
- `prefers-reduced-motion` respected; semantic HTML; ARIA labels on interactive elements

## Folder structure

```
website/
├── app/                    Routes, sitemap, robots, OG, API
├── components/
│   ├── sections/           Hero, WhatIsCiro, HowItWorks, FeaturedCities, Investor, Waitlist, Vision, Footer
│   ├── ui/                 Button, Card, Input, Nav, ThemeToggle, MapBackdrop, GlowOrb, Reveal, SectionHeading, Badge, Logo
│   ├── forms/              Waitlist, Partnership, NotifyMe
│   └── providers/          ThemeProvider
├── lib/                    cities, stories, seo, validation, storage, firebase, site, cn
└── public/                 favicon, logo, manifest
```

## Performance

- `next/image` with AVIF/WebP, priority for above-fold, lazy-load by default
- Framer Motion package import optimized via `experimental.optimizePackageImports`
- Streaming RSCs; client components only where needed (forms, theme toggle, motion)
- Custom security headers (`X-Frame-Options`, `Permissions-Policy`, etc.) configured in `next.config.ts`

## Multilingual readiness

Copy lives in `lib/cities.ts`, `lib/stories.ts`, `lib/site.ts`, `lib/seo.ts`. To add a second locale, drop in `next-intl`, swap each string source for a translated key, and the section components stay untouched.

## Deploy

- **Hostinger Node.js (recommended):** Git deployment — see [`DEPLOY_HOSTINGER.md`](./DEPLOY_HOSTINGER.md).
- **Anywhere else:** `npm ci && npm run build && npm start` works on any Node 20+ host. Set `NEXT_PUBLIC_SITE_URL` to your production origin so canonical URLs and sitemap entries are correct.

---

© 2026 Erfan Soleymanzadeh. Ciro™ — All rights reserved.
