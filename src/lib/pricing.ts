// BLOKR Pricing Logic
// Price per pixel rises as the board fills

const TOTAL_PIXELS = 1024 * 1024 // 1,048,576 pixels
const TOTAL_CELLS = 128 * 128    // 16,384 cells (8×8 px each)
const PIXELS_PER_CELL = 64       // 8 × 8

// Price tiers: [threshold%, multiplier]
// Threshold is percentage of pixels sold
const TIERS: [number, number][] = [
  [0, 1],     // 0-10%: 1x base price
  [10, 2],    // 10-25%: 2x
  [25, 4],    // 25-50%: 4x
  [50, 8],    // 50-75%: 8x
  [75, 16],   // 75-90%: 16x
  [90, 32],   // 90-100%: 32x
]

export function getTierForPixelsSold(pixelsSold: number): number {
  const percentSold = (pixelsSold / TOTAL_PIXELS) * 100

  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (percentSold >= TIERS[i][0]) {
      return i + 1 // Tier number (1-indexed)
    }
  }
  return 1
}

export function getMultiplierForTier(tier: number): number {
  const index = Math.min(tier - 1, TIERS.length - 1)
  return TIERS[index][1]
}

export function calculatePrice(
  basePrice: number,
  pixelsSold: number,
  zonePixels: number
): {
  tier: number
  multiplier: number
  pricePerPixel: number
  totalPrice: bigint
} {
  const tier = getTierForPixelsSold(pixelsSold)
  const multiplier = getMultiplierForTier(tier)
  const pricePerPixel = basePrice * multiplier
  const totalPrice = BigInt(pricePerPixel) * BigInt(zonePixels)

  return {
    tier,
    multiplier,
    pricePerPixel,
    totalPrice,
  }
}

export function cellsToPixels(cells: number): number {
  return cells * PIXELS_PER_CELL
}

export function zoneSizeInPixels(widthCells: number, heightCells: number): number {
  return widthCells * heightCells * PIXELS_PER_CELL
}

export { TOTAL_PIXELS, TOTAL_CELLS, PIXELS_PER_CELL }
