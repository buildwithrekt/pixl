# CLAUDE.md — BLOK

## Project overview

BLOK is a collaborative 1,024×1,024 pixel canvas on Solana. Users and memecoin projects buy rectangular zones and fill them with pixel art or banners. Payment is **on-chain only** (SPL transfer of $BLOK, a pump.fun token, to a public treasury that burns collected tokens); the canvas state (occupancy, pixels) lives **off-chain** in Postgres. Price per pixel rises in tiers as the board fills. At 100%, the final image is minted as a 1/1 NFT and auctioned (V2).

Positioning is honest by design: "payment is on-chain and verifiable, the canvas is a website." Never overclaim on-chain-ness in copy or UI.

## Stack

- **Next.js (App Router)** on Vercel — frontend + API routes
- **shadcn/ui** + Tailwind — components (restyled per design system below)
- **Neon (Postgres) + Prisma** — zones, reservations, price state, events, snapshots
- **Alchemy** — webhook on treasury wallet (incoming ERC20 transfers)
- **Inngest** — reservation expiry, payment reconciliation, composite regeneration, time-lapse
- **wagmi + viem** — MetaMask/Rabby/Coinbase Wallet, ERC20 transfer
- **Robinhood Chain** — Arbitrum L2, Chain ID 4663 (mainnet) / 46630 (testnet)

## Core architecture rules

1. **No custom smart contract for payments.** Payments are plain ERC20 transfers to the treasury wallet with `reservationId` in tx input data.
2. **Reservation flow is the concurrency mechanism**: `POST /api/reserve` locks the rectangle in a Postgres transaction, freezes the price at the current tier, TTL 10 minutes. Payment webhook matches memo → verifies token + amount ≥ frozen price → zone becomes `paid`.
3. **Price is frozen at reservation time.** The user never sees the price change between selection and signature.
4. **Placement granularity: 8×8 px cells** (128×128 grid = 16,384 cells). All rectangles snap to this grid. Occupancy is served as a compact JSON/bitmap, refreshed by light polling (no websockets in V1).
5. **Images are uploaded and moderated before payment** (auto-scan at upload; reject before money moves). Full RGB, no palette constraint.
6. **The composite PNG is the public canvas**: regenerated server-side (sharp) on every confirmed zone, served statically.
7. Zones store `tx_hash`; every zone page links to its transaction on Robinhood Chain explorer. This is the trust surface — never omit it.
8. Orphan payments (bad/expired memo) get a "recover payment" page → manual queue. Never silently swallow a transfer.

## Design system

Source of truth: `pixelboard-landing.html`. The app must feel like the landing — playful, primary colors, off-white paper, pixel accents, hard offset shadows. Reference: Blunder-style minimal structure (small nav, statement typography, one strong illustration/interaction per screen).

### Colors (CSS variables, exact values)

```css
--paper:  #FAF5EA;  /* app background — off-white, never pure white for page bg */
--ink:    #17150F;  /* text, borders, dark sections */
--red:    #E8402A;  /* primary action, burn, alerts */
--blue:   #2A5BFF;  /* links, info, secondary accents */
--yellow: #FFC800;  /* highlights, price chips, ticker bg */
--orange: #FF8A00;  /* flame midtone, warm accents — sparingly */
--cream:  #FFF6DC;  /* flame core, soft fills */
--grid-line: #E9E1CF; /* empty-cell outlines on the board */
```

Rules: surfaces are `--paper` or `#fff` (cards); `--ink` for all borders and text; one primary color per component as its accent (never gradient, never blend). Dark sections use `--ink` bg with `--paper` text, `--yellow` for tags, `--red` for emphasis.

### Typography

- **Display / headlines**: `Bricolage Grotesque`, weight 800, letter-spacing -0.5px, line-height 1.14–1.2. Sizes via clamp (e.g. `clamp(30px, 4.6vw, 56px)` for h1).
- **Body / UI**: `Space Grotesk`, 400/500/700. Base 14.5–15.5px.
- **Pixel accent**: `Silkscreen` — wordmark, eyebrows, chips, tickers, card titles, stat labels, board hints. Small sizes only (10–13px, +0.5–1px letter-spacing). Never for body text or long strings.
- Signature typographic move: key words inside display headlines can be set in Silkscreen with letters cycling through primaries (`red, blue, orange, ink` per letter). Use at most once per page.

### Components

- **Buttons**: bg `--red`, white text, `border: 2px solid var(--ink)`, `border-radius: 8px` (10px for large), `box-shadow: 3px 3px 0 var(--ink)`. Hover: translate(-1px,-1px) + shadow 4px 4px. Active: translate(2px,2px) + shadow 1px 1px. Secondary buttons: white bg, ink text, same border/shadow recipe.
- **Cards**: white bg, `border: 2.5px solid var(--ink)`, `border-radius: 14px`, hard offset shadow `6px 6px 0` in ONE primary color (rotate red/blue/yellow across sibling cards).
- **Chips / badges**: `--yellow` bg (or white with `--blue` border for info), 2px ink border, radius 8px, shadow `3px 3px 0 var(--ink)`, Silkscreen 10–11px.
- **Eyebrows**: Silkscreen 11px, `--blue` text + 2px `--blue` border, pill radius, white bg.
- **Focus states**: `outline: 3px solid var(--blue); outline-offset: 2px` — everywhere, non-negotiable.
- **Selection**: `::selection { background: var(--yellow); }`

### Pixel art & iconography

- All icons and illustrations are **pixel sprites**: SVG `<rect>` grids rendered from string maps (chars → palette), `shape-rendering: crispEdges`. Renderer exists in the landing (`renderSprite`, with half-map mirroring for symmetric sprites) — reuse it, do not import icon libraries for decorative icons (lucide is acceptable for functional UI glyphs inside the app shell only).
- The flame sprite (2-frame flicker, 0.5s steps) is the brand mark of the burn mechanic. Reuse for burn events, treasury dashboard, loading states.
- Empty board cells: `--paper` fill with inset `--grid-line` outline, 2px radius. Filled cells: flat primary, no outline.

### Motion

- Retro, stepped, discrete: `steps(1)` flickers, marquee tickers (28s linear), hard hover translations. No easing curves, no fades, no parallax, no blur.
- `prefers-reduced-motion: reduce` → all animation off (flame static on frame A, ticker static). Already the pattern in the landing; keep it.
- One signature interaction per screen maximum (landing: hover-to-paint on the board strip).

### Voice & copy

- English, CT-native, confident, a bit cheeky, never corporate: "Bought by degens", "Zero mercy on supply", "HOVER TO PAINT — BUY TO KEEP".
- Numbers are content: always show real figures (pixels sold / 1,048,576, tier multiplier, $BLOK burned). Silkscreen + separators for big numbers.
- Buttons say what happens: "Claim your pixels", "Launch app", "Reserve zone", "View burn tx". Sentence case in app UI; UPPERCASE only for Silkscreen labels.
- Honesty rule in copy: on-chain claims apply to payments and burns only.

## Data model (Prisma, summary)

- `Zone`: x, y, w, h (cells), wallet, status (`reserved|paid|drawn|released`), pricePixels, priceTotal, reservationId, ttlExpiresAt, txSignature?, blockTime?, imageUrl?, projectLink?
- `PriceState` (singleton): pixelsSold, currentTier, basePrice, history[]
- `Event`: append-only log for time-lapse + audit
- `BurnTx`: treasury burn records for the dashboard

## Open decisions (do not assume — ask Valentin)

1. Treasury burn cadence (weekly vs per-tier) and burn % (100% vs split)
2. Full RGB everywhere vs enforced palette for aesthetic cohesion
3. Zones immutable in V1 vs owner can update (re-moderated)
4. Max active reservations per wallet, exact TTL
5. Base price in $BLOK at launch