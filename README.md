# ජය ශ්‍රී මහා බෝධිය — Jaya Sri Maha Bodhi (srimahabodhi.com)

A non-profit, ad-free visitor and science guide to Jaya Sri Maha Bodhi in Anuradhapura, Sri Lanka.

## Stack
- Astro 7.3.2 (static output)
- Tailwind CSS 4.3.3 via @tailwindcss/vite
- TypeScript 5.9.3 (within @astrojs/check 0.9.10 peer range ^5 || ^6)
- pnpm 12.4.1
- Node.js 24.21.0 LTS
- `@astrojs/sitemap` for sitemap generation
- PWA: `public/manifest.webmanifest` + `public/sw.js`

## Domain / SITE URL
The domain is `srimahabodhi.com`, which is the built-in default in `astro.config.ts`:

```bash
pnpm build          # builds with https://srimahabodhi.com
```

It can still be overridden when needed:

```bash
SITE_URL=https://another-domain.lk pnpm build
```

`site` is always defined, so `canonical`, `og:url`, `sitemap-index.xml` and every JSON-LD URL are always emitted.

## Commands
```bash
corepack enable
pnpm install
pnpm check
pnpm build
pnpm deploy
```

`pnpm deploy` runs `wrangler deploy`, which uploads `./dist` as a static-asset Worker
(see `wrangler.jsonc` — no `main` entry, no KV/Images bindings required).

## Manual deployment to Cloudflare Workers
1. `pnpm build`
2. Deploy the contents of `dist/` as the Worker's static assets
   (`wrangler.jsonc` → `assets.directory: "./dist"`, or upload `dist/` from the Cloudflare dashboard).
3. Nothing else is uploaded: `node_modules/`, `dist/` sources, `.cache/`, `.astro/` and `.wrangler/` are all listed in `.gitignore`.

## SEO entity binding
All single-attraction entity values live at the top of `src/pages/index.astro`:

| Variable | Value |
| --- | --- |
| `DOMAIN_NAME` | `srimahabodhi.com` |
| `ATTRACTION_FULL_NAME` | `Jaya Sri Maha Bodhi` |
| `ATTRACTION_SHORT_NAME` | `Sri Maha Bodhi` |
| `ATTRACTION_LOCAL_NAME` | `ජය ශ්‍රී මහා බෝධිය` |
| `CITY_NAME` / `STATE_PROVINCE` / `COUNTRY_NAME` | `Anuradhapura` / `North Central Province` / `Sri Lanka` |
| `POSTAL_CODE` / `COUNTRY_CODE_2LETTER` | `50000` / `LK` |
| `LATITUDE` / `LONGITUDE` | `8.3446448` / `80.3972292` |
| `MAPS_SHARE_URL` | `https://maps.app.goo.gl/Xm4DV3tAoWF94of36` |
| `MAPS_EMBED_SRC` | Google Maps `output=embed` URL |
| `NEARBY_LANDMARK_1` / `NEARBY_LANDMARK_2` | `Ruwanwelisaya` / `Lovamahapaya` |
| `GOVT_TOURISM_URL` | `https://www.sltda.gov.lk/` |

Structured data emitted in `<head>`: `TouristAttraction` (with `@id`, `image`, `geo`, `hasMap`, `sameAs`),
`BreadcrumbList` and `FAQPage` (15 questions, mirroring the visible FAQ).

## Google ratings & reviews
- On-page rating: **4.9 / 5** from **14,899** Google Maps reviews, synced **September 2026 / 2026 සැප්තැම්බර්**.
- Reviews are **display-only on the page** and are deliberately **not** included in JSON-LD.
- Every review block, the small-print line and the Sources section carry the attribution
  "synced from Google Maps user reviews; copyright belongs to the original authors and Google Maps"
  plus a link to the Google Maps listing.

## Weather module
- `src/lib/weather.ts` — server-side fetcher. Runs during the Astro render pass and caches the
  response on disk (`.cache/weather.json`, 10-minute TTL) so repeated renders reuse one response.
- `src/lib/weather-shared.ts` — browser-safe logic shared by server and client: request builder,
  WMO code labels (Sinhala + English), plain-language converters and the advice rule engine.
- The current conditions, the 7-day outlook and the advice blocks are server-rendered (so they
  exist without JavaScript and are indexable), then refreshed in the visitor's browser
  on load, on tab focus and every 15 minutes.

### Advice rule engine
`buildWeatherAdvice()` turns raw numbers into four blocks, and only produces the items whose
condition is met — nothing is padded out:

| Block | Trigger examples |
| --- | --- |
| ⚠️ Risk alert (top, red) | thunderstorm, heavy rain, gusts ≥ 50 km/h, feels-like ≥ 40 °C, UV ≥ 11 |
| ✅ What to wear | day–night swing > 8 °C, max ≥ 32 °C, max ≤ 10 °C, wet ground, wind 29–49 km/h, barefoot precinct |
| 🗺️ How to plan the visit | rain chance ≥ 60 %, light rain, thunder/heavy rain, clear/overcast/fog, max ≥ 32 °C, UV ≥ 5 |
| 🎒 What to carry | raincoat vs folding umbrella, sunscreen, water, jacket, socks for hot ground, repellent, mask, hat clip |

Copy is written for visitors, not meteorologists: wind becomes "breezy / windy / strong wind",
UV becomes "moderate / strong / extreme" and humidity becomes "dry / comfortable / muggy",
so nothing reads like "relative humidity 75%". When no risk condition is met the red block is
replaced by a plain "no warnings" line.

Scene coverage is driven by `ANURADHAPURA_PROFILE` (`barefootGround`, `mountain`, `waterside`,
`photography`, `coastal`), so the same engine can enable coastal copy elsewhere; this site is
inland, so sea conditions stay off.
- If the live request fails, the module falls back to long-term climate normals and the page
  states that the values are normals, not live readings.
- Data provider: Open-Meteo (CC BY 4.0), credited in the weather block and in the Sources section.

## Content modules
| Section | Anchor | Purpose |
| --- | --- | --- |
| About / History | `#about`, `#history` | Entity definition, chronicle tradition, conservation notes |
| Practical visit | `#visit` | Hours, dress code, customs |
| Weather | `#weather` | Current conditions + 7-day forecast + practical notes |
| Location & getting here | `#location` | Map, transit, parking approach |
| Nearby landmarks | `#nearby` | Ruwanwelisaya, Lovamahapaya, Thuparama |
| Dining by type | — | Rice & curry, vegetarian, tea shops, water |
| Quarterly strategy | `#seasons` | Climate / crowds / nature / tips per quarter |
| Itineraries | `#plan` | Families, photography, low-mobility + half-day & full-day routes |
| Visitor services | `#facilities` | Toilets, parking, lodging, groceries, fuel/EV, health |
| Science & responsibility | `#stewardship` | Botany, dry-zone ecology, visitor code |
| Reviews | `#reviews` | Google-sourced rating, display only |
| FAQ | `#faq` | 15 questions with `FAQPage` schema |
| Sources | `#sources` | Attribution for maps, ratings, weather, climate normals, imagery |

### Editorial rules
- **No business names.** Dining, lodging and shopping are described by category only; the site is
  non-profit and stays neutral.
- **Bilingual.** Sinhala is the page language; every heading, caution and source note carries an
  English restatement so the page can be verified in both languages.
- **Tradition vs. record.** Chronicle-based accounts (Mahavamsa / Dipavamsa) are labelled as
  tradition; scientific caveats (for example why tree age is not measured by growth rings) are
  stated explicitly.

## GA4
Measurement ID: `G-HXM22WWPKP`.

## Image sources
All photographs are served locally from `/public/images` (no hotlinking):

1. Hirushini Dematagoda — “Sri Maha Bodhi, Anuradhapura.jpg” — CC BY-SA 4.0
2. A.Savin — “SL Anuradhapura asv2020-01 img04 Jaya Sri Maha Bodhi.jpg” — Free Art License
3. Sendaru Perera — “Jaya Sri Maha Bodhiya.jpg” — CC BY-SA 4.0

Originals: <https://commons.wikimedia.org/wiki/Category:Jaya_Sri_Maha_Bodhi>
