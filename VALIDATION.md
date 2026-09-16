# Validation status

Validated in this execution environment (Node.js v24.14.0, npm 11.x, registry + api.open-meteo.com reachable).

## Commands run

```bash
npm install --no-audit --no-fund --engine-strict=false
npm run check
npm run build
```

## Results

| Check | Result |
| --- | --- |
| `npm run check` (astro check) | 0 errors, 0 warnings, 1 hint (external GA `<script async>`) |
| `npm run build` | Complete — 1 page built, output `dist/` |
| `sitemap-index.xml` | created at `dist/` |
| Live weather fetch | confirmed: `{"time":"2026-09-16T10:15","temperature_2m":29.7,"weather_code":3}` |
| Weather disk cache | `.cache/weather.json` written and reused inside the TTL |
| Weather fallback | verified path: if the request fails, long-term climate normals render plus an explicit notice |
| Advice rule engine | 5 scenarios exercised (clear hot / thunder+heavy rain+strong gust / 70 % light rain / overcast+extreme UV / live payload): risks, dress, plan and carry all match their triggers; unmet conditions are simply absent |
| Plain-language copy | built HTML contains no `相对湿度` / `辐照` style jargon; wind, UV and humidity are rendered as everyday words |
| Risk block | hidden when no condition is met — the rendered page shows the neutral “no warnings” line instead |
| JSON-LD blocks | 3 (`TouristAttraction`, `BreadcrumbList`, `FAQPage`) — all parse as valid JSON |
| `FAQPage` questions | 15, matching the visible FAQ |
| Reviews in JSON-LD | none (reviews are display-only, per Google attribution policy) |
| `<h1>` | exactly 1 |
| `<h2>` / `<h3>` | 17 / 27 |
| Sections | `about`, `history`, `visit`, `weather`, `location`, `nearby`, `seasons`, `plan`, `facilities`, `stewardship`, `reviews`, `faq`, `sources` |
| Forbidden marketing copy | `免费`, `API 密钥`, `无需密钥` — all absent from the built HTML |
| Business names | previous merchant names removed; dining/lodging/shopping are category-only |
| PWA | `manifest.webmanifest` + `sw.js` copied to `dist/`, registered inline |
| Smoke test | local static server: `/`, `/manifest.webmanifest`, `/sw.js`, `/sitemap-index.xml` → 200 |

## Notes

- `@astrojs/cloudflare` was removed. The Vite-plugin based adapter starts the `workerd` runtime for
  prerendering, and `workerd` cannot start in this Windows sandbox (`0xc0000005 access violation`).
  The site is fully static, so it builds with `output: 'static'` and deploys to Cloudflare as a
  static-asset Worker (`wrangler.jsonc` → `assets.directory: "./dist"`, no `main`, no KV/Images bindings).
- Because the deploy target is static assets, the weather request cannot run per HTTP request.
  It therefore runs on the server during the render pass (with a disk cache), and the rendered values
  are kept current in the visitor's browser on load, on tab focus and every 15 minutes.
- `wrangler.jsonc` no longer contains `main: ./dist/_worker.js/index.js`: that path is not produced by
  the current adapter and made `astro build` fail its config pre-check.
- Images are served from `/public/images` instead of remote Wikimedia URLs (faster LCP, no hotlinking);
  the Wikimedia source and licences are credited on the page and in `README.md`.
- No lockfile is committed (unchanged from the original repository decision).
