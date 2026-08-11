# BLOK

A collaborative 1,024×1,024 pixel canvas on Solana. Users and memecoin projects buy rectangular zones and fill them with pixel art or banners. Payment is on-chain (SPL transfer of $BLOK token to a public treasury), while the canvas state lives off-chain in Postgres.

## Overview

- **Canvas**: 1,024×1,024 pixels (1,048,576 total pixels)
- **Grid**: 8×8 pixel cells (128×128 grid = 16,384 cells)
- **Payment**: On-chain $BLOK token transfers
- **Pricing**: Dynamic tiers based on canvas fill percentage
- **Endgame**: At 100% fill, the final image is minted as a 1/1 NFT

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Neon (Postgres) + Prisma |
| Styling | Tailwind CSS + shadcn/ui |
| Blockchain | Solana (mainnet) |
| Wallet | Phantom, Solflare (@solana/wallet-adapter) |
| Background Jobs | Inngest |
| Image Processing | Sharp |
| Storage | Vercel Blob |

## Features

- **Zone Reservation**: Lock a rectangular area for 10 minutes with frozen pricing
- **On-chain Payments**: Plain SPL transfers with reservation ID in memo
- **Image Upload**: Upload and moderate images before payment
- **Composite Canvas**: Auto-regenerated PNG on every confirmed zone
- **Price Tiers**: Price per pixel increases as the board fills
- **Orphan Recovery**: Handle payments with bad/expired memos
- **Transaction Transparency**: Every zone links to its on-chain transaction

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── composite/       # Canvas regeneration
│   │   ├── inngest/         # Background job handler
│   │   ├── price/           # Current pricing info
│   │   ├── recover/         # Orphan payment recovery
│   │   ├── reserve/         # Zone reservation
│   │   ├── upload/          # Image upload
│   │   ├── webhook/         # Payment webhooks (Helius/Alchemy)
│   │   └── zones/           # Zone CRUD
│   ├── board/               # Interactive canvas
│   ├── gallery/             # Browse all zones
│   ├── how-it-works/        # How it works page
│   ├── blok/                # $BLOK token info
│   ├── recover/             # Payment recovery page
│   ├── zone/[id]/           # Individual zone view
│   ├── privacy/             # Privacy policy
│   ├── terms/               # Terms of service
│   └── page.tsx             # Landing page
├── components/
│   ├── board/               # Canvas components
│   ├── gallery/             # Gallery components
│   ├── icons/               # Wallet logos
│   ├── sprites/             # Pixel art sprites
│   ├── ui/                  # shadcn/ui components
│   └── wallet/              # Wallet connection
├── hooks/
│   ├── use-countdown.ts     # Reservation timer
│   └── use-payment.ts       # Payment flow
├── lib/
│   ├── composite.ts         # Canvas composition
│   ├── evm.ts               # EVM utilities
│   ├── inngest.ts           # Inngest client
│   ├── inngest-functions.ts # Background jobs
│   ├── pricing.ts           # Price tier logic
│   ├── prisma.ts            # Database client
│   ├── solana.ts            # Solana utilities
│   ├── sprites.tsx          # Pixel sprite renderer
│   ├── utils.ts             # General utilities
│   └── wagmi.ts             # Wagmi config
└── providers/
    └── wallet-provider.tsx  # Wallet context
```

## Database Schema

### Zone
Rectangular purchased area with status flow: `RESERVED → PAID → DRAWN`

### PriceState
Singleton for pricing tiers and pixel sold tracking

### Event
Append-only log for timelapse generation and audit

### BurnTx
Treasury burn records

### OrphanPayment
Payments with bad/expired memos for manual recovery

### Snapshot
Canvas state snapshots for timelapse

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm/npm/yarn
- PostgreSQL database (Neon recommended)
- Solana wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/buildwithrekt/pixl.git
cd pixl

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Push database schema
npm run db:push

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - Neon Postgres connection string
- `NEXT_PUBLIC_CHAIN_ENV` - "testnet" or "mainnet"
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - Alchemy API key
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_BLOK_TOKEN_ADDRESS` - $BLOK ERC20 contract
- `TREASURY_WALLET` - Treasury wallet address
- `ALCHEMY_WEBHOOK_SIGNING_KEY` - Webhook verification
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage
- `CRON_SECRET` - Cron job authentication

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Push Prisma schema to database
npm run db:migrate # Run database migrations
npm run db:seed    # Seed the database
```

## Design System

The app follows a playful, pixel-art inspired design:

- **Colors**: Off-white paper (#FAF5EA), ink (#17150F), red (#E8402A), blue (#2A5BFF), yellow (#FFC800)
- **Typography**: Bricolage Grotesque (display), Space Grotesk (body), Silkscreen (pixel accents)
- **Components**: Hard offset shadows, 2px borders, pixel sprites
- **Motion**: Stepped animations, no easing curves

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/zones` | GET, POST | List/create zones |
| `/api/zones/[id]` | GET | Get zone details |
| `/api/reserve` | POST | Reserve a zone |
| `/api/price` | GET | Current pricing |
| `/api/upload` | POST | Upload zone image |
| `/api/composite` | GET | Get canvas composite |
| `/api/recover` | POST | Recover orphan payment |
| `/api/webhook/helius` | POST | Helius webhook |
| `/api/webhook/alchemy` | POST | Alchemy webhook |
| `/api/inngest` | POST | Inngest handler |

## Flow

1. **Select Zone**: User selects a rectangular area on the canvas
2. **Reserve**: Zone is locked for 10 minutes, price frozen at current tier
3. **Upload**: User uploads image (auto-moderated)
4. **Pay**: User signs SPL transfer with reservation ID in memo
5. **Verify**: Webhook confirms payment
6. **Draw**: Image composited onto canvas

## Deployment

Deploy on Vercel:

```bash
vercel
```

Set all environment variables in the Vercel dashboard.

## License

MIT
