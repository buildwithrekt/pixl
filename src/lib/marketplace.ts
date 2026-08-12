// BLOKR Marketplace Logic
// Floor price calculation and fee management

import { getMultiplierForTier } from "./pricing"

// Platform fee: 5% on each sale
const PLATFORM_FEE_PERCENT = 5n

// Listing expiration: 30 days
export const LISTING_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days in ms

/**
 * Calculate the floor price for a zone based on tier appreciation
 *
 * Floor = Original Purchase Price × (Current Multiplier / Purchase Multiplier)
 *
 * Example:
 * - Bought at Tier 2 (2×) for 100,000 $BLOKR
 * - Now at Tier 4 (8×)
 * - Floor = 100,000 × (8/2) = 400,000 $BLOKR
 */
export function calculateFloorPrice(
  originalPrice: bigint,
  purchaseTier: number,
  currentTier: number
): bigint {
  const purchaseMultiplier = getMultiplierForTier(purchaseTier)
  const currentMultiplier = getMultiplierForTier(currentTier)

  // If current tier <= purchase tier, floor is original price (no appreciation yet)
  if (currentMultiplier <= purchaseMultiplier) {
    return originalPrice
  }

  // Floor = original × (current / purchase)
  return (originalPrice * BigInt(currentMultiplier)) / BigInt(purchaseMultiplier)
}

/**
 * Calculate platform fees and seller proceeds for a sale
 * Platform takes 5%, seller gets 95%
 */
export function calculateFees(salePrice: bigint): {
  platformFee: bigint
  sellerProceeds: bigint
} {
  const platformFee = (salePrice * PLATFORM_FEE_PERCENT) / 100n
  const sellerProceeds = salePrice - platformFee
  return { platformFee, sellerProceeds }
}

/**
 * Calculate listing expiration date (30 days from now)
 */
export function getListingExpiresAt(): Date {
  return new Date(Date.now() + LISTING_DURATION_MS)
}

/**
 * Check if a listing has expired
 */
export function isListingExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Format price for display (with separators)
 */
export function formatPrice(price: bigint): string {
  return price.toLocaleString()
}

/**
 * Validate asking price is >= floor price
 */
export function validateAskingPrice(
  askingPrice: bigint,
  floorPrice: bigint
): { valid: boolean; error?: string } {
  if (askingPrice < floorPrice) {
    return {
      valid: false,
      error: `Asking price must be at least ${formatPrice(floorPrice)} $BLOKR (floor price)`,
    }
  }
  return { valid: true }
}
