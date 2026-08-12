#!/usr/bin/env npx tsx

// ============================================
// BLOKR NFT GENERATOR - CLI (V2 ULTRA GENERATIVE)
// ============================================

import * as fs from 'fs'
import * as path from 'path'
import { generateCollectionV2, generatePreviewV2 } from './generator-v2'
import { CONFIG } from './config'
import { GENERATIVE_STYLES, GenerativeStyle } from './generative'

const STYLES = GENERATIVE_STYLES.map(s => s.type).join(', ')

const HELP = `
🎨 BLOKR NFT GENERATOR V2 - ULTRA GENERATIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USAGE:
  npx tsx scripts/generator/cli.ts <command> [options]

COMMANDS:
  generate [count] [startId] [outputDir]
    Generate the full collection with generative algorithms

    count     Number of NFTs to generate (default: ${CONFIG.totalSupply})
    startId   Starting token ID (default: 1)
    outputDir Output directory (default: ${CONFIG.outputDir})

  preview [outputPath] [style] [seed]
    Generate a single preview image

    outputPath  Path to save preview (default: ./preview.png)
    style       Specific style to use (optional)
    seed        Random seed for reproducibility (optional)

  styles
    List all available generative styles

  stats [outputDir]
    Show statistics from a generated collection

AVAILABLE STYLES:
  ${STYLES}

EXAMPLES:
  npx tsx scripts/generator/cli.ts generate
  npx tsx scripts/generator/cli.ts generate 100 1 ./test-output
  npx tsx scripts/generator/cli.ts preview ./my-preview.png
  npx tsx scripts/generator/cli.ts preview ./my-preview.png mandala
  npx tsx scripts/generator/cli.ts preview ./my-preview.png flow_field 12345
  npx tsx scripts/generator/cli.ts styles
  npx tsx scripts/generator/cli.ts stats ./output

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

async function main() {
  const [command, ...args] = process.argv.slice(2)

  switch (command) {
    case 'generate': {
      const count = parseInt(args[0]) || CONFIG.totalSupply
      const startId = parseInt(args[1]) || 1
      const outputDir = args[2] || CONFIG.outputDir

      await generateCollectionV2(count, startId, outputDir)
      break
    }

    case 'preview': {
      const outputPath = args[0] || './preview.png'
      const styleOrSeed = args[1]
      const seedArg = args[2]

      // Check if second arg is a style or a seed
      let style: GenerativeStyle | undefined
      let seed: number | undefined

      const validStyles = GENERATIVE_STYLES.map(s => s.type)
      if (styleOrSeed && validStyles.includes(styleOrSeed as GenerativeStyle)) {
        style = styleOrSeed as GenerativeStyle
        seed = seedArg ? parseInt(seedArg) : undefined
      } else if (styleOrSeed) {
        seed = parseInt(styleOrSeed)
      }

      console.log('\n🎨 Generating generative preview...')

      const { traits, buffer } = generatePreviewV2(style, seed)

      fs.writeFileSync(outputPath, buffer)

      console.log(`\n✅ Preview saved to: ${outputPath}`)
      console.log(`\n📋 TRAITS:`)
      console.log(`   Style:       ${traits.style.replace(/_/g, ' ')}`)
      console.log(`   Palette:     ${traits.palette.name} (${traits.palette.rarity})`)
      console.log(`   Complexity:  ${traits.complexity}/10`)
      console.log(`   Density:     ${(traits.density * 100).toFixed(0)}%`)
      console.log(`   Chaos:       ${(traits.chaos * 100).toFixed(0)}%`)
      console.log(`   Rarity:      ${traits.rarity.toUpperCase()}`)
      console.log(`   Seed:        ${traits.seed}`)
      console.log()
      break
    }

    case 'styles': {
      console.log('\n🎨 AVAILABLE GENERATIVE STYLES')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      GENERATIVE_STYLES.forEach(style => {
        console.log(`   ${style.type.padEnd(22)} [${style.rarity}] weight: ${style.weight}`)
      })
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      break
    }

    case 'stats': {
      const outputDir = args[0] || CONFIG.outputDir
      const statsPath = path.join(outputDir, 'stats.json')

      if (!fs.existsSync(statsPath)) {
        console.error(`\n❌ Stats file not found: ${statsPath}`)
        console.error('   Run "generate" first to create the collection.')
        process.exit(1)
      }

      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'))

      console.log('\n📊 COLLECTION STATISTICS')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`Total: ${stats.total} Blokrs`)

      console.log('\n🎯 RARITY DISTRIBUTION:')
      Object.entries(stats.byRarity).forEach(([rarity, count]) => {
        const pct = ((count as number) / stats.total * 100).toFixed(1)
        console.log(`   ${rarity.padEnd(10)} ${String(count).padStart(5)} (${pct}%)`)
      })

      console.log('\n🎨 TOP PALETTES:')
      const topPalettes = Object.entries(stats.byPalette)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
      topPalettes.forEach(([name, count]) => {
        console.log(`   ${name.padEnd(15)} ${count}`)
      })

      if (stats.byStyle) {
        console.log('\n🔷 TOP STYLES:')
        const topStyles = Object.entries(stats.byStyle)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 8)
        topStyles.forEach(([name, count]) => {
          console.log(`   ${name.padEnd(20)} ${count}`)
        })
      }

      if (stats.avgComplexity) {
        console.log('\n📈 AVERAGES:')
        console.log(`   Complexity: ${stats.avgComplexity.toFixed(1)}/10`)
        console.log(`   Chaos: ${(stats.avgChaos * 100).toFixed(0)}%`)
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      break
    }

    case 'help':
    case '--help':
    case '-h':
    default:
      console.log(HELP)
      break
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
