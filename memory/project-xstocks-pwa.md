---
name: project-xstocks-pwa
description: xStocks PWA built on Next.js 16 — data sources, architecture, key decisions
metadata:
  type: project
---

xStocks PWA for Jupiter tokenized stocks on Solana.

**Why:** User wants mobile-first PWA tracking top 50 xStocks from jup.ag with real data.

**How to apply:** When making changes, respect B&W theme, small-screen-only layout, and data source hierarchy.

## Data sources
- Token list: `https://token.jup.ag/strict` (filter by `xstock`/`preipo`/`lend` tags, 1h cache)
- Current prices: `https://api.jup.ag/price/v2` (no-store, polled every 30s via SWR)
- Price changes + volume + liquidity: `https://api.dexscreener.com/latest/dex/tokens/{mint}` (60s cache)
- Chart OHLCV: `https://public-api.birdeye.so/defi/history_price` (5min cache, no API key — may fail)

## Architecture
- Next.js 16 App Router, Tailwind v4, TypeScript
- `app/api/xstocks` — aggregates token list + prices (called by SWR every 30s)
- `app/api/stock/[mint]` — single stock detail with chart data
- `app/stock/[mint]/page.tsx` — detail page, params is a Promise (Next.js 16 requirement)
- SWR for client-side polling: 30s for list, 15s for detail
- Recharts AreaChart for price chart (lazy-loaded via `dynamic`)
- PWA: `app/manifest.ts` + `public/sw.js` service worker

## Key Next.js 16 gotchas
- `params` in route handlers and page components is a `Promise` — must `await params`
- `unstable_instant` export requires `cacheComponents: true` in next.config — not used here
- Tailwind v4 uses `@import "tailwindcss"` + `@theme inline {}` for custom tokens
