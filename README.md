# ජය ශ්‍රී මහා බෝධිය — Astro / Tailwind / Cloudflare Worker

## Stack
- Astro 7.3.2
- Tailwind CSS 4.3.3 via @tailwindcss/vite
- TypeScript 5.9.3 (within @astrojs/check 0.9.10 peer range ^5 || ^6)
- pnpm 12.4.1
- Node.js 24.21.0 LTS
- @astrojs/cloudflare 14.3.1

## Domain / SITE URL
There is exactly one site input: `SITE_URL` read in `astro.config.ts` and assigned to Astro's `site` field.

Without a domain:
```bash
pnpm build
```

With a real domain:
```bash
SITE_URL=https://your-real-domain.lk pnpm build
```

When `SITE_URL` is absent, canonical and `og:url` are omitted and `@astrojs/sitemap` is not enabled. No placeholder domain is used.

## Commands
```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm deploy
```

## GA4
Measurement ID: `G-HXM22WWPKP`.

## Image sources
The page uses real location photos hosted by Wikimedia Commons:
1. Hirushini Dematagoda — “Sri Maha Bodhi, Anuradhapura.jpg” — CC BY-SA 4.0
2. A.Savin — “SL Anuradhapura asv2020-01 img04 Jaya Sri Maha Bodhi.jpg” — Free Art License
3. Sendaru Perera — “Jaya Sri Maha Bodhiya.jpg” — CC BY-SA 4.0

The build environment used to prepare this package could not resolve public internet hosts from the filesystem runtime, so these image binaries could not be copied into `/public/images`. The page therefore uses the exact Wikimedia image URLs as a graceful fallback while keeping all brand assets local.
