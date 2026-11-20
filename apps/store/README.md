# Storefront

The store uses Astro 7.4.5 for a static build, with a React and Radix UI Tabs catalog island hydrated with `client:load` because its controls are immediately visible. All product content is prerendered into HTML. It builds to static files for the configured Cloudflare Workers Static Assets deployment; it adds no backend or hosting service. Run root commands from the monorepo root:

```sh
pnpm run dev:store
pnpm run check:store
pnpm run build:store
```

## Catalog maintenance

Edit `src/catalog.ts`, the build-only source of truth for products and image processing. Shared types and selection helpers live in `src/catalog-model.ts`. Astro generates responsive WebP variants at build time. Featured order is the array order. Categories and their counts are derived automatically.

- Mac app: `category: 'apps'`.
- Preset bank: `category: 'presets'`.
- A future sticker or other physical item: `category: 'goods'`. The Physical goods filter appears as soon as that category has an entry. Add its photo with `media.kind: 'image'` and `treatment: 'photo'`.
- `status: 'listed'` requires a real external `destination` link; this status does not assert checkout availability.
- `status: 'placeholder'` requires inline `details` and displays a placeholder label. It never renders a purchase control.

The media union supports supplied images or temporary typographic preset covers. Keep artwork descriptive and use actual dimensions and alt text for images. For copy introducing new characters in Scilla headings, follow the root README's font-regeneration instructions.

Filters are shareable: `?category=apps`, `?category=presets`, `?sort=name-asc`, or `?sort=name-desc`. Combining them is supported, and browser Back restores previous selections.

Payment processing, shipping, checkout, product downloads, account management and licensing remain future decisions. Supporting a physical-goods category is catalog support only.

## Search and performance

The canonical URL is `https://store.misery.co/`; category and sort query variants consolidate onto it. Static `robots.txt` and a sitemap support discovery. Structured data describes the catalog as `CollectionPage`/`ItemList`, without invented Product offers, prices or ratings. The Open Graph image uses actual Swivel artwork.

The decorative shader starts after page load and an idle opportunity. The store opts into `ignorePixelRatio: true` to reduce rendering work on high-DPR screens; the shared shader source and homepage default remain unchanged.

The build runs `scripts/verify-build.mjs` to validate static HTML content, metadata, assets, sitemap, 404 output, and font isolation. Before the pnpm migration, the Astro migration passed a clean dependency install, both app builds and Cloudflare dry runs. Browser checks covered desktop/mobile layouts, hydration, filtering, sorting, keyboard controls and browser Back. A script-blocked browser frame retained all six products, native details and the Swivel link. Local Wrangler checks confirmed a custom HTTP 404, revalidated HTML and immutable fingerprinted assets.

Deployment remains deferred. After deployment, verify the property in Google Search Console, submit the sitemap, and check real-network Core Web Vitals, missing-path HTTP status and asset cache headers. Static rendering makes content available immediately; it does not guarantee rankings or perfect performance scores.
