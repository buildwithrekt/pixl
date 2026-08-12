// ============================================
// BLOKR NFT GENERATOR V2 - ULTRA GENERATIVE
// ============================================

import * as fs from 'fs'
import * as path from 'path'
import { CONFIG, PALETTES, ColorPalette, Rarity } from './config'
import { renderGenerative, GenerativeStyle, GenerativeConfig, GENERATIVE_STYLES } from './generative'

// ============================================
// TYPES
// ============================================

export interface BlokrTraitsV2 {
  id: number
  palette: ColorPalette
  style: GenerativeStyle
  complexity: number
  density: number
  chaos: number
  rarity: Rarity
  seed: number
}

export interface BlokrMetadataV2 {
  name: string
  description: string
  image: string
  external_url: string
  attributes: {
    trait_type: string
    value: string | number
    display_type?: string
  }[]
}

// ============================================
// SEEDED RANDOM
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
// TRAIT GENERATION
// ============================================

function generateTraitsV2(id: number, seed: number): BlokrTraitsV2 {
  const rng = new SeededRandom(seed)

  // Select palette with rarity weighting
  const palettesByRarity = PALETTES.map(p => ({
    ...p,
    weight: CONFIG.rarityWeights[p.rarity],
  }))
  const palette = rng.weightedPick(palettesByRarity)

  // Select generative style
  const styleConfig = rng.weightedPick(GENERATIVE_STYLES)
  const style = styleConfig.type

  // Generate parameters
  const complexity = rng.nextInt(3, 10)
  const density = 0.3 + rng.next() * 0.5
  const chaos = rng.next() * 0.7

  // Calculate rarity
  const rarityScores: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
  }

  const avgScore = (
    rarityScores[palette.rarity] +
    rarityScores[styleConfig.rarity] +
    (complexity > 7 ? 1 : 0) +
    (chaos > 0.5 ? 1 : 0)
  ) / 4

  let rarity: Rarity = 'common'
  if (avgScore >= 4) rarity = 'legendary'
  else if (avgScore >= 3) rarity = 'epic'
  else if (avgScore >= 2.5) rarity = 'rare'
  else if (avgScore >= 1.5) rarity = 'uncommon'

  return {
    id,
    palette,
    style,
    complexity,
    density,
    chaos,
    rarity,
    seed,
  }
}

// ============================================
// METADATA
// ============================================

function generateMetadataV2(traits: BlokrTraitsV2): BlokrMetadataV2 {
  const styleDescriptions: Record<GenerativeStyle, string> = {
    stacked_blocks: 'Tetris-like stacked blocks rising upward',
    block_grid: 'Structured grid of varied colored blocks',
    falling_blocks: 'Blocks floating and falling through space',
    block_city: 'Cityscape skyline built from blocks',
    block_maze: 'Intricate maze constructed of blocks',
    pixel_scatter: 'Scattered clusters of vibrant pixels',
    block_waves: 'Wave patterns formed by aligned blocks',
    digital_rain: 'Matrix-style cascading block rain',
    block_spiral: 'Hypnotic spiral made of rotating blocks',
    tetris_chaos: 'Chaotic arrangement of tetris pieces',
    block_layers: 'Layered horizontal block structures',
    pixel_explosion: 'Explosive burst of pixel clusters',
    block_columns: 'Towering columns of varying heights',
    cellular_blocks: 'Cellular automata patterns in blocks',
    block_mosaic: 'Colorful mosaic of interlocking blocks',
  }

  return {
    name: `${CONFIG.name} #${traits.id}`,
    description: `${styleDescriptions[traits.style]}. A ${traits.rarity} Blokr with ${traits.palette.name} palette.`,
    image: `${traits.id}.png`,
    external_url: `${CONFIG.externalUrl}/nfts/${traits.id}`,
    attributes: [
      { trait_type: 'Palette', value: traits.palette.name },
      { trait_type: 'Palette Rarity', value: traits.palette.rarity },
      { trait_type: 'Style', value: traits.style.replace(/_/g, ' ') },
      { trait_type: 'Complexity', value: traits.complexity, display_type: 'number' },
      { trait_type: 'Density', value: Math.round(traits.density * 100), display_type: 'number' },
      { trait_type: 'Chaos', value: Math.round(traits.chaos * 100), display_type: 'number' },
      { trait_type: 'Rarity', value: traits.rarity },
      { trait_type: 'Generation', value: 2, display_type: 'number' },
    ],
  }
}

// ============================================
// COLLECTION STATS
// ============================================

interface CollectionStats {
  total: number
  byRarity: Record<Rarity, number>
  byPalette: Record<string, number>
  byStyle: Record<string, number>
  avgComplexity: number
  avgChaos: number
}

function calculateStats(allTraits: BlokrTraitsV2[]): CollectionStats {
  const stats: CollectionStats = {
    total: allTraits.length,
    byRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    byPalette: {},
    byStyle: {},
    avgComplexity: 0,
    avgChaos: 0,
  }

  let totalComplexity = 0
  let totalChaos = 0

  allTraits.forEach(traits => {
    stats.byRarity[traits.rarity]++
    stats.byPalette[traits.palette.name] = (stats.byPalette[traits.palette.name] || 0) + 1
    stats.byStyle[traits.style] = (stats.byStyle[traits.style] || 0) + 1
    totalComplexity += traits.complexity
    totalChaos += traits.chaos
  })

  stats.avgComplexity = totalComplexity / allTraits.length
  stats.avgChaos = totalChaos / allTraits.length

  return stats
}

// ============================================
// MAIN GENERATION
// ============================================

export async function generateCollectionV2(
  count: number = CONFIG.totalSupply,
  startId: number = 1,
  outputDir: string = CONFIG.outputDir
) {
  console.log(`\n🎨 BLOKR NFT GENERATOR V2 - ULTRA GENERATIVE`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Generating ${count} unique generative Blokrs...`)
  console.log(`Styles: ${GENERATIVE_STYLES.length} different algorithms`)
  console.log(`Output: ${outputDir}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const imagesDir = path.join(outputDir, 'images')
  const metadataDir = path.join(outputDir, 'metadata')

  fs.mkdirSync(imagesDir, { recursive: true })
  fs.mkdirSync(metadataDir, { recursive: true })

  const allTraits: BlokrTraitsV2[] = []
  const usedSeeds = new Set<number>()
  const startTime = Date.now()

  for (let i = 0; i < count; i++) {
    const id = startId + i

    // Generate unique seed
    let seed: number
    do {
      seed = Date.now() + i * 7919 + Math.floor(Math.random() * 100000)
    } while (usedSeeds.has(seed))
    usedSeeds.add(seed)

    const traits = generateTraitsV2(id, seed)
    allTraits.push(traits)

    // Generate image
    const genConfig: GenerativeConfig = {
      style: traits.style,
      palette: traits.palette,
      seed: traits.seed,
      complexity: traits.complexity,
      density: traits.density,
      chaos: traits.chaos,
    }

    const imageBuffer = renderGenerative(genConfig)
    const imagePath = path.join(imagesDir, `${id}.png`)
    fs.writeFileSync(imagePath, imageBuffer)

    // Generate metadata
    const metadata = generateMetadataV2(traits)
    const metadataPath = path.join(metadataDir, `${id}.json`)
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

    // Progress
    if ((i + 1) % 10 === 0 || i + 1 === count) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
      const rate = ((i + 1) / parseFloat(elapsed)).toFixed(1)
      const pct = ((i + 1) / count * 100).toFixed(0)
      console.log(`✓ ${i + 1}/${count} (${pct}%) - ${elapsed}s - ${rate}/s - Style: ${traits.style}`)
    }
  }

  // Save stats
  const stats = calculateStats(allTraits)
  fs.writeFileSync(path.join(outputDir, 'stats.json'), JSON.stringify(stats, null, 2))
  fs.writeFileSync(path.join(outputDir, 'all-traits.json'), JSON.stringify(allTraits, null, 2))

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ GENERATION COMPLETE`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Total: ${allTraits.length} Blokrs`)
  console.log(`Time: ${totalTime}s`)
  console.log(`\n📊 RARITY:`)
  Object.entries(stats.byRarity).forEach(([rarity, count]) => {
    const pct = ((count as number) / allTraits.length * 100).toFixed(1)
    console.log(`   ${rarity.padEnd(10)} ${String(count).padStart(4)} (${pct}%)`)
  })
  console.log(`\n🎨 STYLES:`)
  Object.entries(stats.byStyle)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .forEach(([style, count]) => {
      console.log(`   ${style.padEnd(20)} ${count}`)
    })
  console.log(`\n📈 AVERAGES:`)
  console.log(`   Complexity: ${stats.avgComplexity.toFixed(1)}/10`)
  console.log(`   Chaos: ${(stats.avgChaos * 100).toFixed(0)}%`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return { traits: allTraits, stats }
}

// ============================================
// PREVIEW
// ============================================

export function generatePreviewV2(
  style?: GenerativeStyle,
  seed?: number
): { traits: BlokrTraitsV2; buffer: Buffer } {
  const actualSeed = seed ?? Date.now()
  const traits = generateTraitsV2(0, actualSeed)

  // Override style if specified
  if (style) {
    traits.style = style
  }

  const genConfig: GenerativeConfig = {
    style: traits.style,
    palette: traits.palette,
    seed: traits.seed,
    complexity: traits.complexity,
    density: traits.density,
    chaos: traits.chaos,
  }

  const buffer = renderGenerative(genConfig)
  return { traits, buffer }
}

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const args = process.argv.slice(2)
  const count = parseInt(args[0]) || CONFIG.totalSupply
  const startId = parseInt(args[1]) || 1
  const outputDir = args[2] || CONFIG.outputDir

  generateCollectionV2(count, startId, outputDir)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Generation failed:', err)
      process.exit(1)
    })
}
