// ============================================
// BLOKR NFT GENERATOR - MAIN GENERATOR
// ============================================

import * as fs from 'fs'
import * as path from 'path'
import {
  CONFIG,
  PALETTES,
  BACKGROUNDS,
  SHAPES,
  COMPOSITIONS,
  EFFECTS,
  MUTATIONS,
  SPECIAL_TRAITS,
  ColorPalette,
  BackgroundType,
  ShapeType,
  CompositionType,
  EffectType,
  MutationType,
  SpecialTrait,
  Rarity,
  BackgroundConfig,
  ShapeConfig,
  CompositionConfig,
  EffectConfig,
  MutationConfig,
  SpecialTraitConfig,
} from './config'
import { renderBlokr } from './renderer'

// ============================================
// TYPES
// ============================================

export interface BlokrTraits {
  id: number
  palette: ColorPalette
  background: BackgroundType
  primaryShape: ShapeType
  secondaryShape: ShapeType | null
  composition: CompositionType
  shapesCount: number
  effect: EffectType
  effectIntensity: number
  mutation: MutationType
  special: SpecialTrait
  rarity: Rarity
  seed: number
}

export interface BlokrMetadata {
  name: string
  description: string
  image: string
  external_url: string
  attributes: {
    trait_type: string
    value: string | number
    display_type?: string
  }[]
  properties: {
    files: { uri: string; type: string }[]
    category: string
    creators: { address: string; share: number }[]
  }
}

// ============================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================

class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  weightedPick<T extends { weight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = this.next() * totalWeight

    for (const item of items) {
      random -= item.weight
      if (random <= 0) return item
    }

    return items[items.length - 1]
  }
}

// ============================================
// RARITY CALCULATION
// ============================================

function calculateOverallRarity(traits: BlokrTraits): Rarity {
  const rarityScores: Record<Rarity, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  }

  const paletteRarity = traits.palette.rarity
  const backgroundRarity = BACKGROUNDS.find(b => b.type === traits.background)?.rarity || 'common'
  const shapeRarity = SHAPES.find(s => s.type === traits.primaryShape)?.rarity || 'common'
  const compositionRarity = COMPOSITIONS.find(c => c.type === traits.composition)?.rarity || 'common'
  const effectRarity = EFFECTS.find(e => e.type === traits.effect)?.rarity || 'common'
  const mutationRarity = MUTATIONS.find(m => m.type === traits.mutation)?.rarity || 'common'
  const specialRarity = SPECIAL_TRAITS.find(s => s.type === traits.special)?.rarity || 'common'

  const avgScore = (
    rarityScores[paletteRarity] +
    rarityScores[backgroundRarity] +
    rarityScores[shapeRarity] +
    rarityScores[compositionRarity] +
    rarityScores[effectRarity] +
    rarityScores[mutationRarity] +
    rarityScores[specialRarity] * 2 // Special traits count double
  ) / 8

  if (avgScore >= 4.5) return 'legendary'
  if (avgScore >= 3.5) return 'epic'
  if (avgScore >= 2.5) return 'rare'
  if (avgScore >= 1.5) return 'uncommon'
  return 'common'
}

// ============================================
// TRAIT GENERATION
// ============================================

function generateTraits(id: number, seed: number): BlokrTraits {
  const rng = new SeededRandom(seed)

  // Select palette (by rarity weighting)
  const palettesByRarity = PALETTES.map(p => ({
    ...p,
    weight: CONFIG.rarityWeights[p.rarity],
  }))
  const palette = rng.weightedPick(palettesByRarity)

  // Select background
  const background = rng.weightedPick(BACKGROUNDS).type

  // Select primary shape
  const primaryShapeConfig = rng.weightedPick(SHAPES)
  const primaryShape = primaryShapeConfig.type

  // Select secondary shape (70% chance)
  let secondaryShape: ShapeType | null = null
  if (rng.next() > 0.3) {
    const otherShapes = SHAPES.filter(s => s.type !== primaryShape)
    secondaryShape = rng.weightedPick(otherShapes).type
  }

  // Select composition
  const compositionConfig = rng.weightedPick(COMPOSITIONS)
  const composition = compositionConfig.type
  const shapesCount = rng.nextInt(compositionConfig.shapesCount[0], compositionConfig.shapesCount[1])

  // Select effect
  const effectConfig = rng.weightedPick(EFFECTS)
  const effect = effectConfig.type
  const effectIntensity = effectConfig.intensity[0] + rng.next() * (effectConfig.intensity[1] - effectConfig.intensity[0])

  // Select mutation
  const mutation = rng.weightedPick(MUTATIONS).type

  // Select special trait
  const special = rng.weightedPick(SPECIAL_TRAITS).type

  const traits: BlokrTraits = {
    id,
    palette,
    background,
    primaryShape,
    secondaryShape,
    composition,
    shapesCount,
    effect,
    effectIntensity,
    mutation,
    special,
    rarity: 'common', // Will be calculated
    seed,
  }

  traits.rarity = calculateOverallRarity(traits)

  return traits
}

// ============================================
// UNIQUENESS CHECK
// ============================================

function getTraitHash(traits: BlokrTraits): string {
  return [
    traits.palette.name,
    traits.background,
    traits.primaryShape,
    traits.secondaryShape || 'none',
    traits.composition,
    traits.effect,
    traits.mutation,
    traits.special,
  ].join('|')
}

// ============================================
// METADATA GENERATION
// ============================================

function generateMetadata(traits: BlokrTraits): BlokrMetadata {
  const rarityEmoji: Record<Rarity, string> = {
    common: '',
    uncommon: '',
    rare: '',
    epic: '',
    legendary: '',
  }

  return {
    name: `${CONFIG.name} #${traits.id}`,
    description: `${CONFIG.description} This ${traits.rarity} Blokr features a ${traits.palette.name} palette with ${traits.composition} composition.`,
    image: `${traits.id}.png`,
    external_url: `${CONFIG.externalUrl}/nfts/${traits.id}`,
    attributes: [
      { trait_type: 'Palette', value: traits.palette.name },
      { trait_type: 'Background', value: traits.background },
      { trait_type: 'Primary Shape', value: traits.primaryShape },
      ...(traits.secondaryShape ? [{ trait_type: 'Secondary Shape', value: traits.secondaryShape }] : []),
      { trait_type: 'Composition', value: traits.composition },
      { trait_type: 'Shapes Count', value: traits.shapesCount, display_type: 'number' },
      { trait_type: 'Effect', value: traits.effect },
      ...(traits.effect !== 'none' ? [{ trait_type: 'Effect Intensity', value: Math.round(traits.effectIntensity * 100), display_type: 'number' }] : []),
      { trait_type: 'Mutation', value: traits.mutation },
      { trait_type: 'Special', value: traits.special },
      { trait_type: 'Rarity', value: traits.rarity },
      { trait_type: 'Generation', value: 1, display_type: 'number' },
    ],
    properties: {
      files: [{ uri: `${traits.id}.png`, type: 'image/png' }],
      category: 'image',
      creators: [{ address: 'BLOKR_CREATOR_WALLET', share: 100 }],
    },
  }
}

// ============================================
// COLLECTION STATS
// ============================================

interface CollectionStats {
  total: number
  byRarity: Record<Rarity, number>
  byPalette: Record<string, number>
  byBackground: Record<string, number>
  byShape: Record<string, number>
  byComposition: Record<string, number>
  byEffect: Record<string, number>
  bySpecial: Record<string, number>
}

function calculateStats(allTraits: BlokrTraits[]): CollectionStats {
  const stats: CollectionStats = {
    total: allTraits.length,
    byRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    byPalette: {},
    byBackground: {},
    byShape: {},
    byComposition: {},
    byEffect: {},
    bySpecial: {},
  }

  allTraits.forEach(traits => {
    stats.byRarity[traits.rarity]++
    stats.byPalette[traits.palette.name] = (stats.byPalette[traits.palette.name] || 0) + 1
    stats.byBackground[traits.background] = (stats.byBackground[traits.background] || 0) + 1
    stats.byShape[traits.primaryShape] = (stats.byShape[traits.primaryShape] || 0) + 1
    stats.byComposition[traits.composition] = (stats.byComposition[traits.composition] || 0) + 1
    stats.byEffect[traits.effect] = (stats.byEffect[traits.effect] || 0) + 1
    stats.bySpecial[traits.special] = (stats.bySpecial[traits.special] || 0) + 1
  })

  return stats
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

export async function generateCollection(
  count: number = CONFIG.totalSupply,
  startId: number = 1,
  outputDir: string = CONFIG.outputDir
) {
  console.log(`\n🎨 BLOKR NFT GENERATOR`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Generating ${count} unique Blokrs...`)
  console.log(`Output: ${outputDir}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  // Create output directories
  const imagesDir = path.join(outputDir, 'images')
  const metadataDir = path.join(outputDir, 'metadata')

  fs.mkdirSync(imagesDir, { recursive: true })
  fs.mkdirSync(metadataDir, { recursive: true })

  const allTraits: BlokrTraits[] = []
  const usedHashes = new Set<string>()
  const startTime = Date.now()

  let attempts = 0
  const maxAttempts = count * 10

  for (let i = 0; i < count && attempts < maxAttempts; attempts++) {
    const id = startId + i
    const seed = Date.now() + attempts * 1337 + id * 7919

    const traits = generateTraits(id, seed)
    const hash = getTraitHash(traits)

    // Ensure uniqueness
    if (usedHashes.has(hash)) {
      continue
    }

    usedHashes.add(hash)
    allTraits.push(traits)

    // Generate image
    const imageBuffer = renderBlokr(traits)
    const imagePath = path.join(imagesDir, `${id}.png`)
    fs.writeFileSync(imagePath, imageBuffer)

    // Generate metadata
    const metadata = generateMetadata(traits)
    const metadataPath = path.join(metadataDir, `${id}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    // Progress
    if ((i + 1) % 100 === 0 || i + 1 === count) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      const rate = ((i + 1) / parseFloat(elapsed)).toFixed(1)
      console.log(`✓ ${i + 1}/${count} generated (${elapsed}s, ${rate}/s)`)
    }

    i++
  }

  // Calculate and save stats
  const stats = calculateStats(allTraits)
  const statsPath = path.join(outputDir, 'stats.json')
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2))

  // Save all traits
  const traitsPath = path.join(outputDir, 'all-traits.json')
  fs.writeFileSync(traitsPath, JSON.stringify(allTraits, null, 2))

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ GENERATION COMPLETE`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Total: ${allTraits.length} Blokrs`)
  console.log(`Time: ${totalTime}s`)
  console.log(`\n📊 RARITY DISTRIBUTION:`)
  console.log(`   Common:    ${stats.byRarity.common} (${(stats.byRarity.common / allTraits.length * 100).toFixed(1)}%)`)
  console.log(`   Uncommon:  ${stats.byRarity.uncommon} (${(stats.byRarity.uncommon / allTraits.length * 100).toFixed(1)}%)`)
  console.log(`   Rare:      ${stats.byRarity.rare} (${(stats.byRarity.rare / allTraits.length * 100).toFixed(1)}%)`)
  console.log(`   Epic:      ${stats.byRarity.epic} (${(stats.byRarity.epic / allTraits.length * 100).toFixed(1)}%)`)
  console.log(`   Legendary: ${stats.byRarity.legendary} (${(stats.byRarity.legendary / allTraits.length * 100).toFixed(1)}%)`)
  console.log(`\n📁 OUTPUT:`)
  console.log(`   Images:   ${imagesDir}`)
  console.log(`   Metadata: ${metadataDir}`)
  console.log(`   Stats:    ${statsPath}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return { traits: allTraits, stats }
}

// ============================================
// PREVIEW GENERATION (single image)
// ============================================

export function generatePreview(seed?: number): { traits: BlokrTraits; buffer: Buffer } {
  const actualSeed = seed ?? Date.now()
  const traits = generateTraits(0, actualSeed)
  const buffer = renderBlokr(traits)
  return { traits, buffer }
}

// ============================================
// CLI EXECUTION
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2)
  const count = parseInt(args[0]) || CONFIG.totalSupply
  const startId = parseInt(args[1]) || 1
  const outputDir = args[2] || CONFIG.outputDir

  generateCollection(count, startId, outputDir)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Generation failed:', err)
      process.exit(1)
    })
}
