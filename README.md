# Jaya Sri Maha Bodhi independent visitor guide

A nonprofit tourism and educational information guide in Sinhala and English. It is independent of the temple, government tourism authorities and UNESCO, and does not sell tickets.

## Existing static architecture

Astro 7.3.2, Tailwind 4.3.3, sitemap 3.7.4, TypeScript 5.9.3, check 0.9.10 and Wrangler 4.131.2 remain pinned. Use Node 24.21.0 and pnpm 12.4.1. The committed `pnpm-lock.yaml` records transitive dependencies. `pnpm-workspace.yaml` permits only the reviewed exact esbuild and workerd installer versions; other dependency scripts remain unapproved.

```sh
pnpm install --frozen-lockfile
pnpm check
npm run build
npx wrangler deploy --dry-run
pnpm exec wrangler dev --local --port 8928
```

Building emits static HTML to `dist/`. The small `worker/index.mjs` guard canonicalizes the existing HTTP/www entrances, preserving path and query, and adds a noindex header to asset 404 responses. It delegates content to the native ASSETS binding; it adds no external storage, service or domain binding. `wrangler.jsonc` names the existing Cloudflare project `srimahabodhi`.

The historical successful Cloudflare build used Bun 1.2.15 for automatic dependency installation despite detecting pnpm 12.4.1, followed by `npm run build` and `npx wrangler deploy`. It warned about the old source Worker name and had no committed lock to cache. This was not a failed deployment. The pnpm lock now establishes a reproducible install; final Cloudflare package-manager selection must be checked on the next authorized build.

## Content and data boundaries

- One bilingual root page; both existing languages are retained on that page. There are no separate locale URLs, so no invented language-alternate routes.
- UNESCO and Sri Lanka Tourism support the historical context, not a current temple tariff or daily timetable.
- The dated Google Maps rating/count is attributed visibly and is not used as guide-collected review schema. No user review text is republished.
- Current official temple hours, admission, facilities and step-free routes remain unverified. The page explains what to confirm and distinguishes CCF archaeological tickets from temple admission.
- Weather is fetched by the browser from Open-Meteo. The static HTML contains no current/forecast numbers. Failure, malformed or stale data stays unavailable; no climate normals generate fake current values or future dates. Source/model and retrieval times are shown. Weather does not establish access or closure.
- The replacement service worker retires legacy page/weather caches and does not intercept network requests.
- Existing automatic Google Analytics is retained. Public privacy text describes its actual behavior, Cloudflare hosting and direct Open-Meteo requests. Maps is an external link, not an embedded third-party request at page load.
- Exact photo sources, authors, licenses and modification notices are in [CREDITS.md](CREDITS.md) and alongside each visible photograph.

`dist/` is intentionally ignored and reproduced by the build. Source, output, Worker HTTP and visual acceptance are separate checks. Local success is not a claim that a release was deployed or verified in production.
