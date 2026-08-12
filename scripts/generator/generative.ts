// ============================================
// BLOKR NFT GENERATOR - BLOCK-FOCUSED GENERATIVE
// ============================================

import { createCanvas, CanvasRenderingContext2D } from 'canvas'
import { CONFIG, ColorPalette } from './config'
import { PerlinNoise, runCellularAutomata, CellRule } from './noise'

// ============================================
// TYPES
// ============================================

export type GenerativeStyle =
  | 'stacked_blocks'      // Tetris-like stacked blocks
  | 'block_grid'          // Grid of varied blocks
  | 'falling_blocks'      // Blocks falling/floating
  | 'block_city'          // Cityscape of blocks
  | 'block_maze'          // Maze made of blocks
  | 'pixel_scatter'       // Scattered pixel clusters
  | 'block_waves'         // Wave patterns made of blocks
  | 'digital_rain'        // Matrix-style falling blocks
  | 'block_spiral'        // Spiral made of blocks
  | 'tetris_chaos'        // Random tetris pieces
  | 'block_layers'        // Layered block structures
  | 'pixel_explosion'     // Exploding pixel clusters
  | 'block_columns'       // Columns of varying heights
  | 'cellular_blocks'     // Cellular automata with blocks
  | 'block_mosaic'        // Mosaic of colored blocks

export interface GenerativeConfig {
  style: GenerativeStyle
  palette: ColorPalette
  seed: number
  complexity: number // 1-10
  density: number // 0-1
  chaos: number // 0-1
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
}

// ============================================
// BRAND COLOR - Always present in every image
// ============================================

const BRAND_LIME = '#CEFD00'

// ============================================
// COLOR UTILITIES
// ============================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 }
}

function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex)
  const nr = Math.min(255, Math.max(0, Math.round(r * factor)))
  const ng = Math.min(255, Math.max(0, Math.round(g * factor)))
  const nb = Math.min(255, Math.max(0, Math.round(b * factor)))
  return `rgb(${nr},${ng},${nb})`
}

// ============================================
// BRAND LIME ACCENTS
// ============================================

function addBrandLimeAccents(
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  pixelSize: number,
  seed: number,
  intensity: number = 0.15 // 0-1, how much lime to add
) {
  const rng = new SeededRandom(seed + 9999)

  // Add scattered lime pixels/blocks
  const accentCount = Math.floor(5 + intensity * 30)

  for (let i = 0; i < accentCount; i++) {
    const x = rng.nextInt(0, gridSize - 1)
    const y = rng.nextInt(0, gridSize - 1)
    const size = rng.nextInt(1, 3)

    // Draw lime block with highlight
    drawBlock(ctx, x, y, size, size, BRAND_LIME, pixelSize, size > 1)
  }

  // Add a few lime highlights on edges (signature touch)
  const edgeAccents = Math.floor(3 + intensity * 8)
  for (let i = 0; i < edgeAccents; i++) {
    const onTop = rng.next() > 0.5
    const x = rng.nextInt(0, gridSize - 2)
    const y = onTop ? rng.nextInt(0, 3) : rng.nextInt(gridSize - 4, gridSize - 1)

    drawPixel(ctx, x, y, BRAND_LIME, pixelSize)
    if (rng.next() > 0.5) {
      drawPixel(ctx, x + 1, y, BRAND_LIME, pixelSize)
    }
  }
}

// ============================================
// BLOCK DRAWING UTILITIES
// ============================================

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  pixelSize: number,
  withShadow: boolean = true
) {
  const px = x * pixelSize
  const py = y * pixelSize
  const pw = w * pixelSize
  const ph = h * pixelSize

  // Main block
  ctx.fillStyle = color
  ctx.fillRect(px, py, pw, ph)

  if (withShadow && pw > pixelSize && ph > pixelSize) {
    // Highlight (top-left)
    ctx.fillStyle = adjustBrightness(color, 1.3)
    ctx.fillRect(px, py, pw, pixelSize)
    ctx.fillRect(px, py, pixelSize, ph)

    // Shadow (bottom-right)
    ctx.fillStyle = adjustBrightness(color, 0.6)
    ctx.fillRect(px, py + ph - pixelSize, pw, pixelSize)
    ctx.fillRect(px + pw - pixelSize, py, pixelSize, ph)
  }
}

function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  pixelSize: number
) {
  ctx.fillStyle = color
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
}

// ============================================
// TETRIS PIECES
// ============================================

const TETRIS_PIECES = [
  // I
  [[1, 1, 1, 1]],
  // O
  [[1, 1], [1, 1]],
  // T
  [[0, 1, 0], [1, 1, 1]],
  // L
  [[1, 0], [1, 0], [1, 1]],
  // J
  [[0, 1], [0, 1], [1, 1]],
  // S
  [[0, 1, 1], [1, 1, 0]],
  // Z
  [[1, 1, 0], [0, 1, 1]],
]

function drawTetrisPiece(
  ctx: CanvasRenderingContext2D,
  piece: number[][],
  startX: number,
  startY: number,
  color: string,
  pixelSize: number,
  blockSize: number = 1
) {
  for (let y = 0; y < piece.length; y++) {
    for (let x = 0; x < piece[y].length; x++) {
      if (piece[y][x]) {
        drawBlock(
          ctx,
          startX + x * blockSize,
          startY + y * blockSize,
          blockSize,
          blockSize,
          color,
          pixelSize
        )
      }
    }
  }
}

// ============================================
// STYLE RENDERERS
// ============================================

function renderStackedBlocks(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  // Create columns of stacked blocks
  const columnCount = Math.floor(4 + config.complexity)
  const columnWidth = Math.floor(gridSize / columnCount)

  for (let col = 0; col < columnCount; col++) {
    const x = col * columnWidth
    let y = gridSize

    // Stack blocks from bottom
    const blockCount = Math.floor(3 + rng.next() * config.density * 10)

    for (let b = 0; b < blockCount; b++) {
      const blockHeight = rng.nextInt(2, 6)
      const blockWidth = rng.nextInt(Math.floor(columnWidth * 0.5), columnWidth)
      const offsetX = rng.nextInt(0, columnWidth - blockWidth)

      y -= blockHeight

      if (y < 0) break

      const color = rng.pick(colors)
      drawBlock(ctx, x + offsetX, y, blockWidth, blockHeight, color, pixelSize)
    }
  }
}

function renderBlockGrid(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const cellSize = Math.floor(2 + config.complexity / 2)
  const gap = 1

  for (let y = 0; y < gridSize; y += cellSize + gap) {
    for (let x = 0; x < gridSize; x += cellSize + gap) {
      if (rng.next() < config.density) {
        const size = rng.nextInt(1, cellSize)
        const color = rng.pick(colors)
        drawBlock(ctx, x, y, size, size, color, pixelSize)
      }
    }
  }
}

function renderFallingBlocks(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const blockCount = Math.floor(20 + config.density * 50)

  for (let i = 0; i < blockCount; i++) {
    const x = rng.nextInt(0, gridSize - 4)
    const y = rng.nextInt(0, gridSize - 4)
    const w = rng.nextInt(2, 5)
    const h = rng.nextInt(2, 5)
    const color = rng.pick(colors)

    drawBlock(ctx, x, y, w, h, color, pixelSize)
  }
}

function renderBlockCity(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background (sky)
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  // Buildings
  const buildingCount = Math.floor(8 + config.complexity * 2)
  const buildingWidth = Math.floor(gridSize / buildingCount)

  for (let i = 0; i < buildingCount; i++) {
    const x = i * buildingWidth + rng.nextInt(0, 2)
    const height = rng.nextInt(Math.floor(gridSize * 0.3), Math.floor(gridSize * 0.9))
    const width = buildingWidth - rng.nextInt(1, 3)
    const y = gridSize - height

    const color = rng.pick(colors)
    drawBlock(ctx, x, y, width, height, color, pixelSize)

    // Windows
    if (width > 3 && height > 6) {
      const windowColor = config.palette.background
      for (let wy = y + 2; wy < gridSize - 2; wy += 3) {
        for (let wx = x + 1; wx < x + width - 1; wx += 2) {
          if (rng.next() > 0.3) {
            drawPixel(ctx, wx, wy, windowColor, pixelSize)
          }
        }
      }
    }
  }
}

function renderBlockMaze(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const grid = runCellularAutomata(gridSize, gridSize, 'maze', 5, 0.45, config.seed)

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  // Draw maze walls as blocks
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x]) {
        drawBlock(ctx, x, y, 1, 1, config.palette.primary, pixelSize, false)
      }
    }
  }
}

function renderPixelScatter(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const noise = new PerlinNoise(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  // Cluster centers
  const clusterCount = Math.floor(3 + config.complexity)
  const clusters: { x: number; y: number; color: string }[] = []

  for (let i = 0; i < clusterCount; i++) {
    clusters.push({
      x: rng.nextInt(5, gridSize - 5),
      y: rng.nextInt(5, gridSize - 5),
      color: rng.pick(colors),
    })
  }

  // Scatter pixels around clusters
  const pixelCount = Math.floor(100 + config.density * 400)

  for (let i = 0; i < pixelCount; i++) {
    const cluster = rng.pick(clusters)
    const angle = rng.next() * Math.PI * 2
    const dist = rng.next() * (5 + config.chaos * 15)

    const x = Math.floor(cluster.x + Math.cos(angle) * dist)
    const y = Math.floor(cluster.y + Math.sin(angle) * dist)

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      drawPixel(ctx, x, y, cluster.color, pixelSize)
    }
  }
}

function renderBlockWaves(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const waveCount = Math.floor(3 + config.complexity / 2)
  const amplitude = 3 + config.chaos * 5

  for (let wave = 0; wave < waveCount; wave++) {
    const baseY = Math.floor((wave + 1) * gridSize / (waveCount + 1))
    const color = colors[wave % colors.length]
    const freq = 0.1 + wave * 0.05

    for (let x = 0; x < gridSize; x++) {
      const y = Math.floor(baseY + Math.sin(x * freq + wave) * amplitude)
      const height = Math.floor(2 + Math.sin(x * freq * 2) * 2)

      for (let h = 0; h < height; h++) {
        if (y + h >= 0 && y + h < gridSize) {
          drawPixel(ctx, x, y + h, color, pixelSize)
        }
      }
    }
  }
}

function renderDigitalRain(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const columnCount = Math.floor(gridSize / 2)

  for (let col = 0; col < columnCount; col++) {
    const x = col * 2
    const streamLength = rng.nextInt(5, Math.floor(gridSize * 0.8))
    const startY = rng.nextInt(0, gridSize - streamLength)
    const color = rng.pick(colors)

    for (let i = 0; i < streamLength; i++) {
      const y = startY + i
      const alpha = 1 - (i / streamLength) * 0.7

      // Brighter at the head
      const brightness = i === 0 ? 1.5 : 1 - (i / streamLength) * 0.5
      const adjustedColor = adjustBrightness(color, brightness)

      if (rng.next() < config.density) {
        drawPixel(ctx, x, y, adjustedColor, pixelSize)
        if (rng.next() > 0.7) {
          drawPixel(ctx, x + 1, y, adjustedColor, pixelSize)
        }
      }
    }
  }
}

function renderBlockSpiral(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const centerX = gridSize / 2
  const centerY = gridSize / 2
  const maxRadius = gridSize / 2 - 2
  const turns = 2 + config.complexity / 2
  const blockCount = Math.floor(50 + config.density * 150)

  for (let i = 0; i < blockCount; i++) {
    const t = i / blockCount
    const angle = t * Math.PI * 2 * turns
    const radius = t * maxRadius

    const x = Math.floor(centerX + Math.cos(angle) * radius)
    const y = Math.floor(centerY + Math.sin(angle) * radius)

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      const color = colors[i % colors.length]
      const size = Math.floor(1 + (1 - t) * 2)
      drawBlock(ctx, x, y, size, size, color, pixelSize, false)
    }
  }
}

function renderTetrisChaos(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const pieceCount = Math.floor(10 + config.density * 30)
  const blockSize = Math.floor(2 + config.complexity / 3)

  for (let i = 0; i < pieceCount; i++) {
    const piece = rng.pick(TETRIS_PIECES)
    const x = rng.nextInt(0, gridSize - piece[0].length * blockSize)
    const y = rng.nextInt(0, gridSize - piece.length * blockSize)
    const color = rng.pick(colors)

    drawTetrisPiece(ctx, piece, x, y, color, pixelSize, blockSize)
  }
}

function renderBlockLayers(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const layerCount = Math.floor(4 + config.complexity)
  const layerHeight = Math.floor(gridSize / layerCount)

  for (let layer = 0; layer < layerCount; layer++) {
    const y = layer * layerHeight
    const color = colors[layer % colors.length]

    // Draw blocks in this layer
    const blockCount = Math.floor(5 + rng.next() * 10 * config.density)

    for (let b = 0; b < blockCount; b++) {
      const bx = rng.nextInt(0, gridSize - 4)
      const bw = rng.nextInt(2, 6)
      const bh = rng.nextInt(1, layerHeight - 1)
      const by = y + rng.nextInt(0, layerHeight - bh)

      drawBlock(ctx, bx, by, bw, bh, color, pixelSize)
    }
  }
}

function renderPixelExplosion(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const centerX = gridSize / 2
  const centerY = gridSize / 2
  const pixelCount = Math.floor(200 + config.density * 500)

  for (let i = 0; i < pixelCount; i++) {
    const angle = rng.next() * Math.PI * 2
    const dist = rng.next() * rng.next() * (gridSize / 2) * config.chaos + 2
    const size = Math.max(1, Math.floor(3 - dist / (gridSize / 4)))

    const x = Math.floor(centerX + Math.cos(angle) * dist)
    const y = Math.floor(centerY + Math.sin(angle) * dist)

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      const color = rng.pick(colors)
      drawBlock(ctx, x, y, size, size, color, pixelSize, false)
    }
  }
}

function renderBlockColumns(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const noise = new PerlinNoise(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  const columnWidth = Math.floor(2 + config.complexity / 3)

  for (let x = 0; x < gridSize; x += columnWidth) {
    const noiseVal = (noise.noise2D(x * 0.1, config.seed * 0.01) + 1) / 2
    const height = Math.floor(noiseVal * gridSize * config.density + gridSize * 0.1)
    const color = colors[Math.floor(x / columnWidth) % colors.length]

    drawBlock(ctx, x, gridSize - height, columnWidth - 1, height, color, pixelSize)
  }
}

function renderCellularBlocks(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rules: CellRule[] = ['caves', 'coral', 'crystals']
  const rule = rules[config.seed % rules.length]
  const grid = runCellularAutomata(gridSize, gridSize, rule, 6, config.density * 0.5 + 0.3, config.seed)

  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  // Draw cells as blocks with color based on neighbors
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x]) {
        // Count neighbors for color variation
        let neighbors = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy
            const nx = x + dx
            if (ny >= 0 && ny < gridSize && nx >= 0 && nx < gridSize && grid[ny][nx]) {
              neighbors++
            }
          }
        }
        const color = colors[neighbors % colors.length]
        drawPixel(ctx, x, y, color, pixelSize)
      }
    }
  }
}

function renderBlockMosaic(
  ctx: CanvasRenderingContext2D,
  config: GenerativeConfig,
  gridSize: number,
  pixelSize: number
) {
  const rng = new SeededRandom(config.seed)
  const colors = [config.palette.primary, config.palette.secondary, config.palette.accent, config.palette.background]

  // Fill background
  ctx.fillStyle = config.palette.background
  ctx.fillRect(0, 0, CONFIG.imageSize, CONFIG.imageSize)

  // Subdivide recursively
  function subdivide(x: number, y: number, w: number, h: number, depth: number) {
    if (depth <= 0 || w < 2 || h < 2 || rng.next() > 0.85) {
      const color = rng.pick(colors)
      if (color !== config.palette.background) {
        drawBlock(ctx, x, y, w, h, color, pixelSize)
      }
      return
    }

    const splitVertical = rng.next() > 0.5

    if (splitVertical && w > 2) {
      const split = rng.nextInt(1, w - 1)
      subdivide(x, y, split, h, depth - 1)
      subdivide(x + split, y, w - split, h, depth - 1)
    } else if (h > 2) {
      const split = rng.nextInt(1, h - 1)
      subdivide(x, y, w, split, depth - 1)
      subdivide(x, y + split, w, h - split, depth - 1)
    }
  }

  subdivide(0, 0, gridSize, gridSize, Math.floor(3 + config.complexity / 2))
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

export function renderGenerative(config: GenerativeConfig): Buffer {
  const size = CONFIG.imageSize
  const gridSize = CONFIG.gridSize
  const pixelSize = size / gridSize

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Disable anti-aliasing for crisp pixels
  ctx.imageSmoothingEnabled = false

  switch (config.style) {
    case 'stacked_blocks':
      renderStackedBlocks(ctx, config, gridSize, pixelSize)
      break
    case 'block_grid':
      renderBlockGrid(ctx, config, gridSize, pixelSize)
      break
    case 'falling_blocks':
      renderFallingBlocks(ctx, config, gridSize, pixelSize)
      break
    case 'block_city':
      renderBlockCity(ctx, config, gridSize, pixelSize)
      break
    case 'block_maze':
      renderBlockMaze(ctx, config, gridSize, pixelSize)
      break
    case 'pixel_scatter':
      renderPixelScatter(ctx, config, gridSize, pixelSize)
      break
    case 'block_waves':
      renderBlockWaves(ctx, config, gridSize, pixelSize)
      break
    case 'digital_rain':
      renderDigitalRain(ctx, config, gridSize, pixelSize)
      break
    case 'block_spiral':
      renderBlockSpiral(ctx, config, gridSize, pixelSize)
      break
    case 'tetris_chaos':
      renderTetrisChaos(ctx, config, gridSize, pixelSize)
      break
    case 'block_layers':
      renderBlockLayers(ctx, config, gridSize, pixelSize)
      break
    case 'pixel_explosion':
      renderPixelExplosion(ctx, config, gridSize, pixelSize)
      break
    case 'block_columns':
      renderBlockColumns(ctx, config, gridSize, pixelSize)
      break
    case 'cellular_blocks':
      renderCellularBlocks(ctx, config, gridSize, pixelSize)
      break
    case 'block_mosaic':
      renderBlockMosaic(ctx, config, gridSize, pixelSize)
      break
    default:
      renderBlockGrid(ctx, config, gridSize, pixelSize)
  }

  // Always add brand lime accents (#CEFD00)
  addBrandLimeAccents(ctx, gridSize, pixelSize, config.seed, 0.1 + config.density * 0.2)

  return canvas.toBuffer('image/png')
}

// ============================================
// STYLE CONFIGURATIONS
// ============================================

export const GENERATIVE_STYLES: { type: GenerativeStyle; weight: number; rarity: string }[] = [
  { type: 'block_grid', weight: 12, rarity: 'common' },
  { type: 'stacked_blocks', weight: 12, rarity: 'common' },
  { type: 'falling_blocks', weight: 10, rarity: 'common' },
  { type: 'block_columns', weight: 10, rarity: 'common' },
  { type: 'pixel_scatter', weight: 10, rarity: 'common' },
  { type: 'block_waves', weight: 8, rarity: 'uncommon' },
  { type: 'cellular_blocks', weight: 8, rarity: 'uncommon' },
  { type: 'tetris_chaos', weight: 7, rarity: 'uncommon' },
  { type: 'block_layers', weight: 6, rarity: 'uncommon' },
  { type: 'digital_rain', weight: 5, rarity: 'rare' },
  { type: 'block_spiral', weight: 5, rarity: 'rare' },
  { type: 'block_maze', weight: 4, rarity: 'rare' },
  { type: 'pixel_explosion', weight: 3, rarity: 'epic' },
  { type: 'block_city', weight: 3, rarity: 'epic' },
  { type: 'block_mosaic', weight: 2, rarity: 'legendary' },
]
