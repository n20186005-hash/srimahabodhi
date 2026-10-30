# Validation boundaries

Use the pinned runtime and package manager with a normal frozen installation, then run `pnpm check`, `npm run build` and `npx wrangler deploy --dry-run`. This repository keeps static Astro output and the native Cloudflare asset service.

Check generated homepage and 404 metadata, one H1 per page, unique IDs, FAQ/schema agreement, all local links/images, sitemap contents and noindex errors. Check the native Worker locally for HTTP/www redirects preserving paths and queries, successful known assets, GET/HEAD and genuine unknown-path 404 responses.

Weather fixtures should cover unavailable/malformed/stale responses and WMO thunder/heavy-rain codes independently of precipitation probability. Initial static HTML must not embed fabricated forecasts or a stale build-time snapshot. Verify the cache-retirement worker no longer intercepts navigation or dynamic weather.

Review both Sinhala and English, photo captions/attribution and the full public tree for private diagnostics, credentials and local paths. A real browser must separately verify menu keyboard/touch use, image decoding and readable layouts at narrow, intermediate and desktop widths. Source checks and runtime fixtures are not browser acceptance. Deployment and final-domain checks require a separately authorized release.
