// ============================================
// BLOKR NFT GENERATOR - RENDERER
// ============================================

import { createCanvas, CanvasRenderingContext2D, Canvas } from 'canvas'
import {
  CONFIG,
  ColorPalette,
  BackgroundType,
  EffectType,
  CompositionType,
  MutationType,
} from './config'
import { ShapeGrid, getShape, mirrorHorizontal, mirrorVertical, rotate90, rotate180, rotate270, invertGrid } from './shapes'
import { BlokrTraits } from './generator'

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

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function blendColors(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)
  return rgbToHex(
    c1.r + (c2.r - c1.r) * factor,
    c1.g + (c2.g - c1.g) * factor,
    c1.b + (c2.b - c1.b) * factor
  )
}

function adjustBrightness(color: string, factor: number): string {
  const { r, g, b } = hexToRgb(color)
  return rgbToHex(r * factor, g * factor, b * factor)
}

// ============================================
// BACKGROUND RENDERERS
// ============================================

function renderSolidBackground(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)
}

function renderGradientBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  color1: string,
  color2: string,
  angle: number = Math.random() * 360
) {
  const radians = angle * Math.PI / 180
  const x1 = size / 2 - Math.cos(radians) * size
  const y1 = size / 2 - Math.sin(radians) * size
  const x2 = size / 2 + Math.cos(radians) * size
  const y2 = size / 2 + Math.sin(radians) * size

  const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
}

function renderNoiseBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  baseColor: string,
  intensity: number = 0.15
) {
  const { r, g, b } = hexToRgb(baseColor)
  const imageData = ctx.createImageData(size, size)

  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * intensity
    imageData.data[i] = Math.max(0, Math.min(255, r + noise))
    imageData.data[i + 1] = Math.max(0, Math.min(255, g + noise))
    imageData.data[i + 2] = Math.max(0, Math.min(255, b + noise))
    imageData.data[i + 3] = 255
  }

  ctx.putImageData(imageData, 0, 0)
}

function renderGridBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  lineColor: string,
  cellSize: number = CONFIG.pixelSize
) {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = lineColor
  ctx.lineWidth = 1

  for (let x = 0; x <= size; x += cellSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
    ctx.stroke()
  }

  for (let y = 0; y <= size; y += cellSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }
}

function renderDotsBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  dotColor: string,
  spacing: number = CONFIG.pixelSize * 2
) {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = dotColor
  const dotSize = spacing / 6

  for (let x = spacing / 2; x < size; x += spacing) {
    for (let y = spacing / 2; y < size; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function renderScanlinesBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  lineColor: string,
  spacing: number = 4
) {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = lineColor
  for (let y = 0; y < size; y += spacing) {
    ctx.fillRect(0, y, size, 1)
  }
}

function renderCircuitBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  bgColor: string,
  lineColor: string
) {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = lineColor
  ctx.lineWidth = 2

  const gridSize = CONFIG.pixelSize * 2
  const nodes: { x: number; y: number }[] = []

  // Create nodes
  for (let x = gridSize; x < size - gridSize; x += gridSize) {
    for (let y = gridSize; y < size - gridSize; y += gridSize) {
      if (Math.random() > 0.7) {
        nodes.push({ x, y })
      }
    }
  }

  // Draw connections
  nodes.forEach((node, i) => {
    const connections = Math.floor(Math.random() * 3) + 1
    for (let c = 0; c < connections; c++) {
      const target = nodes[Math.floor(Math.random() * nodes.length)]
      if (target && target !== node) {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)

        // L-shaped connection
        if (Math.random() > 0.5) {
          ctx.lineTo(target.x, node.y)
          ctx.lineTo(target.x, target.y)
        } else {
          ctx.lineTo(node.x, target.y)
          ctx.lineTo(target.x, target.y)
        }
        ctx.stroke()
      }
    }
  })

  // Draw nodes
  ctx.fillStyle = lineColor
  nodes.forEach(node => {
    ctx.fillRect(node.x - 3, node.y - 3, 6, 6)
  })
}

function renderRadialBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  centerColor: string,
  edgeColor: string
) {
  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.7)
  gradient.addColorStop(0, centerColor)
  gradient.addColorStop(1, edgeColor)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  type: BackgroundType,
  palette: ColorPalette
) {
  const secondary = palette.secondary || adjustBrightness(palette.background, 0.8)

  switch (type) {
    case 'solid':
      renderSolidBackground(ctx, size, palette.background)
      break
    case 'gradient':
      renderGradientBackground(ctx, size, palette.background, secondary)
      break
    case 'noise':
      renderNoiseBackground(ctx, size, palette.background, 0.1)
      break
    case 'grid':
      renderGridBackground(ctx, size, palette.background, adjustBrightness(palette.background, 0.85))
      break
    case 'dots':
      renderDotsBackground(ctx, size, palette.background, adjustBrightness(palette.background, 0.7))
      break
    case 'scanlines':
      renderScanlinesBackground(ctx, size, palette.background, adjustBrightness(palette.background, 0.9))
      break
    case 'circuit':
      renderCircuitBackground(ctx, size, palette.background, adjustBrightness(palette.background, 0.6))
      break
    case 'radial':
      renderRadialBackground(ctx, size, palette.background, adjustBrightness(palette.background, 0.7))
      break
  }
}

// ============================================
// SHAPE RENDERER
// ============================================

function applyMutation(grid: ShapeGrid, mutation: MutationType): ShapeGrid {
  switch (mutation) {
    case 'mirror_h':
      return mirrorHorizontal(grid)
    case 'mirror_v':
      return mirrorVertical(grid)
    case 'mirror_both':
      return mirrorVertical(mirrorHorizontal(grid))
    case 'rotate_90':
      return rotate90(grid)
    case 'rotate_180':
      return rotate180(grid)
    case 'rotate_270':
      return rotate270(grid)
    case 'invert':
      return invertGrid(grid)
    case 'shift':
      // Shift rows randomly
      return grid.map((row, i) => {
        const shift = Math.floor(Math.sin(i * 0.5) * 2)
        const newRow = [...row]
        if (shift > 0) {
          return [...newRow.slice(-shift), ...newRow.slice(0, -shift)]
        } else if (shift < 0) {
          return [...newRow.slice(-shift), ...newRow.slice(0, -shift)]
        }
        return row
      })
    case 'stretch':
      // Stretch horizontally
      return grid.map(row => {
        const newRow: boolean[] = []
        row.forEach(cell => {
          newRow.push(cell, cell)
        })
        return newRow.slice(0, row.length)
      })
    case 'compress':
      // Compress vertically
      return grid.filter((_, i) => i % 2 === 0)
    default:
      return grid
  }
}

export function renderShape(
  ctx: CanvasRenderingContext2D,
  grid: ShapeGrid,
  x: number,
  y: number,
  pixelSize: number,
  color: string,
  mutation: MutationType = 'none'
) {
  const mutatedGrid = applyMutation(grid, mutation)

  ctx.fillStyle = color

  for (let gy = 0; gy < mutatedGrid.length; gy++) {
    for (let gx = 0; gx < (mutatedGrid[gy]?.length || 0); gx++) {
      if (mutatedGrid[gy][gx]) {
        ctx.fillRect(
          x + gx * pixelSize,
          y + gy * pixelSize,
          pixelSize,
          pixelSize
        )
      }
    }
  }
}

// ============================================
// COMPOSITION RENDERERS
// ============================================

interface ShapePlacement {
  grid: ShapeGrid
  x: number
  y: number
  color: string
  size: number
}

function generateCenteredComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize
  const center = Math.floor(gridCells / 2)

  // Main centered shape
  const mainSize = Math.floor(gridCells * 0.4) + Math.floor(Math.random() * 4)
  const mainGrid = getShape(traits.primaryShape, mainSize)

  placements.push({
    grid: mainGrid,
    x: (center - Math.floor(mainSize / 2)) * pixelSize,
    y: (center - Math.floor(mainSize / 2)) * pixelSize,
    color: traits.palette.primary,
    size: mainSize,
  })

  // Optional secondary shapes
  if (Math.random() > 0.5 && traits.secondaryShape) {
    const secSize = Math.floor(mainSize * 0.5)
    const secGrid = getShape(traits.secondaryShape, secSize)

    // Place around the center
    const positions = [
      { x: center - mainSize / 2 - secSize, y: center - secSize / 2 },
      { x: center + mainSize / 2, y: center - secSize / 2 },
    ]

    positions.forEach(pos => {
      if (Math.random() > 0.5) {
        placements.push({
          grid: secGrid,
          x: pos.x * pixelSize,
          y: pos.y * pixelSize,
          color: traits.palette.secondary,
          size: secSize,
        })
      }
    })
  }

  return placements
}

function generateScatteredComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number,
  count: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize

  for (let i = 0; i < count; i++) {
    const shapeType = i === 0 ? traits.primaryShape : (Math.random() > 0.5 ? traits.primaryShape : (traits.secondaryShape || traits.primaryShape))
    const size = Math.floor(Math.random() * 6) + 3
    const grid = getShape(shapeType, size)

    const x = Math.floor(Math.random() * (gridCells - size))
    const y = Math.floor(Math.random() * (gridCells - size))

    const colors = [traits.palette.primary, traits.palette.secondary, traits.palette.accent]
    const color = colors[Math.floor(Math.random() * colors.length)]

    placements.push({
      grid,
      x: x * pixelSize,
      y: y * pixelSize,
      color,
      size,
    })
  }

  return placements
}

function generateGridComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize
  const cols = Math.floor(Math.random() * 2) + 2
  const rows = cols
  const cellSize = Math.floor(gridCells / cols)
  const shapeSize = Math.floor(cellSize * 0.6)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() > 0.3) {
        const shapeType = Math.random() > 0.6 ? traits.primaryShape : (traits.secondaryShape || traits.primaryShape)
        const grid = getShape(shapeType, shapeSize)

        const x = col * cellSize + Math.floor((cellSize - shapeSize) / 2)
        const y = row * cellSize + Math.floor((cellSize - shapeSize) / 2)

        const colors = [traits.palette.primary, traits.palette.secondary]
        const color = colors[(row + col) % colors.length]

        placements.push({
          grid,
          x: x * pixelSize,
          y: y * pixelSize,
          color,
          size: shapeSize,
        })
      }
    }
  }

  return placements
}

function generateRadialComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number,
  count: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize
  const center = gridCells / 2
  const radius = gridCells * 0.3

  // Center piece
  const centerSize = Math.floor(gridCells * 0.2)
  const centerGrid = getShape(traits.primaryShape, centerSize)
  placements.push({
    grid: centerGrid,
    x: (center - centerSize / 2) * pixelSize,
    y: (center - centerSize / 2) * pixelSize,
    color: traits.palette.primary,
    size: centerSize,
  })

  // Orbiting shapes
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const x = center + Math.cos(angle) * radius
    const y = center + Math.sin(angle) * radius

    const size = Math.floor(gridCells * 0.08) + 2
    const grid = getShape(traits.secondaryShape || traits.primaryShape, size)

    placements.push({
      grid,
      x: (x - size / 2) * pixelSize,
      y: (y - size / 2) * pixelSize,
      color: i % 2 === 0 ? traits.palette.secondary : traits.palette.accent,
      size,
    })
  }

  return placements
}

function generateSpiralComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number,
  count: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize
  const center = gridCells / 2

  for (let i = 0; i < count; i++) {
    const angle = i * 0.5
    const radius = i * 1.5
    const x = center + Math.cos(angle) * radius
    const y = center + Math.sin(angle) * radius

    if (x > 0 && x < gridCells && y > 0 && y < gridCells) {
      const size = Math.max(2, Math.floor(4 - i * 0.2))
      const grid = getShape(traits.primaryShape, size)

      const colors = [traits.palette.primary, traits.palette.secondary, traits.palette.accent]
      const color = colors[i % colors.length]

      placements.push({
        grid,
        x: (x - size / 2) * pixelSize,
        y: (y - size / 2) * pixelSize,
        color,
        size,
      })
    }
  }

  return placements
}

function generateFractalComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number,
  depth: number = 3
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize

  function fractal(x: number, y: number, size: number, d: number) {
    if (d <= 0 || size < 2) return

    const grid = getShape(traits.primaryShape, size)
    const colors = [traits.palette.primary, traits.palette.secondary, traits.palette.accent]

    placements.push({
      grid,
      x: x * pixelSize,
      y: y * pixelSize,
      color: colors[d % colors.length],
      size,
    })

    const newSize = Math.floor(size * 0.5)
    const offset = size * 0.6

    // Spawn children
    if (Math.random() > 0.3) fractal(x - offset, y, newSize, d - 1)
    if (Math.random() > 0.3) fractal(x + offset, y, newSize, d - 1)
    if (Math.random() > 0.3) fractal(x, y - offset, newSize, d - 1)
    if (Math.random() > 0.3) fractal(x, y + offset, newSize, d - 1)
  }

  fractal(gridCells / 2, gridCells / 2, Math.floor(gridCells * 0.25), depth)
  return placements
}

function generateDiagonalComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number,
  count: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize

  for (let i = 0; i < count; i++) {
    const progress = i / count
    const x = progress * gridCells * 0.8 + gridCells * 0.1
    const y = progress * gridCells * 0.8 + gridCells * 0.1

    const size = Math.floor(Math.random() * 4) + 4
    const grid = getShape(i % 2 === 0 ? traits.primaryShape : (traits.secondaryShape || traits.primaryShape), size)

    placements.push({
      grid,
      x: (x - size / 2) * pixelSize,
      y: (y - size / 2) * pixelSize,
      color: i % 2 === 0 ? traits.palette.primary : traits.palette.secondary,
      size,
    })
  }

  return placements
}

function generateLayeredComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number,
  layers: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize
  const center = gridCells / 2

  for (let layer = layers - 1; layer >= 0; layer--) {
    const size = Math.floor(gridCells * 0.15 * (layer + 1))
    const grid = getShape(traits.primaryShape, size)

    const colors = [traits.palette.primary, traits.palette.secondary, traits.palette.accent]

    placements.push({
      grid,
      x: (center - size / 2) * pixelSize,
      y: (center - size / 2) * pixelSize,
      color: colors[layer % colors.length],
      size,
    })
  }

  return placements
}

function generateSymmetricalComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number
): ShapePlacement[] {
  const placements: ShapePlacement[] = []
  const gridCells = canvasSize / pixelSize
  const center = gridCells / 2

  // Generate one side
  const sideShapes: { x: number; y: number; size: number }[] = []
  const count = Math.floor(Math.random() * 3) + 2

  for (let i = 0; i < count; i++) {
    sideShapes.push({
      x: Math.random() * (center - 4) + 2,
      y: Math.random() * (gridCells - 8) + 4,
      size: Math.floor(Math.random() * 4) + 3,
    })
  }

  // Mirror both sides
  sideShapes.forEach((shape, i) => {
    const grid = getShape(traits.primaryShape, shape.size)
    const colors = [traits.palette.primary, traits.palette.secondary]

    // Left side
    placements.push({
      grid,
      x: shape.x * pixelSize,
      y: shape.y * pixelSize,
      color: colors[i % 2],
      size: shape.size,
    })

    // Right side (mirrored)
    placements.push({
      grid: mirrorHorizontal(grid),
      x: (gridCells - shape.x - shape.size) * pixelSize,
      y: shape.y * pixelSize,
      color: colors[i % 2],
      size: shape.size,
    })
  })

  return placements
}

export function generateComposition(
  traits: BlokrTraits,
  canvasSize: number,
  pixelSize: number
): ShapePlacement[] {
  const shapesCount = traits.shapesCount

  switch (traits.composition) {
    case 'centered':
      return generateCenteredComposition(traits, canvasSize, pixelSize)
    case 'scattered':
      return generateScatteredComposition(traits, canvasSize, pixelSize, shapesCount)
    case 'grid':
      return generateGridComposition(traits, canvasSize, pixelSize)
    case 'radial':
      return generateRadialComposition(traits, canvasSize, pixelSize, shapesCount)
    case 'spiral':
      return generateSpiralComposition(traits, canvasSize, pixelSize, shapesCount)
    case 'fractal':
      return generateFractalComposition(traits, canvasSize, pixelSize, 4)
    case 'diagonal':
      return generateDiagonalComposition(traits, canvasSize, pixelSize, shapesCount)
    case 'layered':
      return generateLayeredComposition(traits, canvasSize, pixelSize, shapesCount)
    case 'symmetrical':
      return generateSymmetricalComposition(traits, canvasSize, pixelSize)
    case 'clustered':
      return generateScatteredComposition(traits, canvasSize, pixelSize, shapesCount)
    case 'orbital':
      return generateRadialComposition(traits, canvasSize, pixelSize, shapesCount)
    case 'asymmetrical':
      return generateScatteredComposition(traits, canvasSize, pixelSize, shapesCount)
    default:
      return generateCenteredComposition(traits, canvasSize, pixelSize)
  }
}

// ============================================
// EFFECTS RENDERERS
// ============================================

export function applyGlow(
  ctx: CanvasRenderingContext2D,
  canvas: Canvas,
  color: string,
  intensity: number
) {
  ctx.shadowColor = color
  ctx.shadowBlur = intensity * 30
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Redraw content with glow
  ctx.drawImage(canvas, 0, 0)
  ctx.shadowBlur = 0
}

export function applyShadow(
  ctx: CanvasRenderingContext2D,
  size: number,
  intensity: number
) {
  const imageData = ctx.getImageData(0, 0, size, size)
  const offset = Math.floor(intensity * 8) + 2

  // Create shadow layer
  const shadowData = ctx.createImageData(size, size)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const srcIdx = (y * size + x) * 4
      const alpha = imageData.data[srcIdx + 3]

      if (alpha > 128) {
        const dstX = x + offset
        const dstY = y + offset

        if (dstX < size && dstY < size) {
          const dstIdx = (dstY * size + dstX) * 4
          shadowData.data[dstIdx] = 0
          shadowData.data[dstIdx + 1] = 0
          shadowData.data[dstIdx + 2] = 0
          shadowData.data[dstIdx + 3] = Math.floor(128 * intensity)
        }
      }
    }
  }

  // Draw shadow first, then original
  const tempCanvas = createCanvas(size, size)
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.putImageData(imageData, 0, 0)

  ctx.putImageData(shadowData, 0, 0)
  ctx.drawImage(tempCanvas, 0, 0)
}

export function applyNoise(
  ctx: CanvasRenderingContext2D,
  size: number,
  intensity: number
) {
  const imageData = ctx.getImageData(0, 0, size, size)

  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] > 0) {
      const noise = (Math.random() - 0.5) * 255 * intensity
      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise))
      imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise))
      imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise))
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function applyScanlines(
  ctx: CanvasRenderingContext2D,
  size: number,
  intensity: number
) {
  ctx.fillStyle = `rgba(0, 0, 0, ${intensity * 0.3})`
  const spacing = 3

  for (let y = 0; y < size; y += spacing) {
    ctx.fillRect(0, y, size, 1)
  }
}

export function applyGlitch(
  ctx: CanvasRenderingContext2D,
  size: number,
  intensity: number
) {
  const imageData = ctx.getImageData(0, 0, size, size)
  const glitchCount = Math.floor(intensity * 10) + 2

  for (let g = 0; g < glitchCount; g++) {
    const y = Math.floor(Math.random() * size)
    const height = Math.floor(Math.random() * 10) + 2
    const shift = Math.floor((Math.random() - 0.5) * 20)

    for (let row = y; row < Math.min(y + height, size); row++) {
      for (let x = 0; x < size; x++) {
        const srcX = (x + shift + size) % size
        const srcIdx = (row * size + srcX) * 4
        const dstIdx = (row * size + x) * 4

        // Color channel shift
        imageData.data[dstIdx] = imageData.data[srcIdx]
        imageData.data[dstIdx + 1] = imageData.data[((row * size + ((x + 2) % size)) * 4) + 1]
        imageData.data[dstIdx + 2] = imageData.data[((row * size + ((x - 2 + size) % size)) * 4) + 2]
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function applyChromaticAberration(
  ctx: CanvasRenderingContext2D,
  size: number,
  intensity: number
) {
  const imageData = ctx.getImageData(0, 0, size, size)
  const result = ctx.createImageData(size, size)
  const offset = Math.floor(intensity * 5) + 1

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4

      // Red channel shifted left
      const rX = Math.max(0, x - offset)
      const rIdx = (y * size + rX) * 4
      result.data[idx] = imageData.data[rIdx]

      // Green channel unchanged
      result.data[idx + 1] = imageData.data[idx + 1]

      // Blue channel shifted right
      const bX = Math.min(size - 1, x + offset)
      const bIdx = (y * size + bX) * 4
      result.data[idx + 2] = imageData.data[bIdx + 2]

      result.data[idx + 3] = imageData.data[idx + 3]
    }
  }

  ctx.putImageData(result, 0, 0)
}

export function applyCRT(
  ctx: CanvasRenderingContext2D,
  size: number,
  intensity: number
) {
  // Scanlines
  applyScanlines(ctx, size, intensity * 0.5)

  // Vignette
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, size * 0.3,
    size / 2, size / 2, size * 0.8
  )
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, `rgba(0,0,0,${intensity * 0.5})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Slight curvature effect via chromatic
  applyChromaticAberration(ctx, size, intensity * 0.3)
}

export function applyDither(
  ctx: CanvasRenderingContext2D,
  size: number,
  intensity: number
) {
  const imageData = ctx.getImageData(0, 0, size, size)
  const levels = Math.floor(4 / intensity)

  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] > 0) {
      for (let c = 0; c < 3; c++) {
        const oldVal = imageData.data[i + c]
        const newVal = Math.round(oldVal / 255 * levels) / levels * 255
        imageData.data[i + c] = newVal

        // Floyd-Steinberg dithering (simplified)
        const error = oldVal - newVal
        if (i + 4 < imageData.data.length) {
          imageData.data[i + 4 + c] += error * 7 / 16
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function applyOutline(
  ctx: CanvasRenderingContext2D,
  size: number,
  outlineColor: string,
  thickness: number = 2
) {
  const imageData = ctx.getImageData(0, 0, size, size)
  const outline = ctx.createImageData(size, size)
  const { r, g, b } = hexToRgb(outlineColor)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4

      // Check if current pixel is transparent but has opaque neighbor
      if (imageData.data[idx + 3] < 128) {
        let hasOpaqueNeighbor = false

        for (let dy = -thickness; dy <= thickness; dy++) {
          for (let dx = -thickness; dx <= thickness; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
              const nIdx = (ny * size + nx) * 4
              if (imageData.data[nIdx + 3] > 128) {
                hasOpaqueNeighbor = true
                break
              }
            }
          }
          if (hasOpaqueNeighbor) break
        }

        if (hasOpaqueNeighbor) {
          outline.data[idx] = r
          outline.data[idx + 1] = g
          outline.data[idx + 2] = b
          outline.data[idx + 3] = 255
        }
      }
    }
  }

  // Draw outline first
  const tempCanvas = createCanvas(size, size)
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.putImageData(imageData, 0, 0)

  ctx.putImageData(outline, 0, 0)
  ctx.drawImage(tempCanvas, 0, 0)
}

export function applyEffect(
  ctx: CanvasRenderingContext2D,
  canvas: Canvas,
  size: number,
  effect: EffectType,
  intensity: number,
  palette: ColorPalette
) {
  switch (effect) {
    case 'glow':
      if (palette.glow) {
        applyGlow(ctx, canvas, palette.glow, intensity)
      }
      break
    case 'shadow':
      applyShadow(ctx, size, intensity)
      break
    case 'outline':
      applyOutline(ctx, size, palette.accent, Math.ceil(intensity * 3))
      break
    case 'noise':
      applyNoise(ctx, size, intensity)
      break
    case 'scanlines':
      applyScanlines(ctx, size, intensity)
      break
    case 'glitch':
      applyGlitch(ctx, size, intensity)
      break
    case 'chromatic':
      applyChromaticAberration(ctx, size, intensity)
      break
    case 'crt':
      applyCRT(ctx, size, intensity)
      break
    case 'dither':
      applyDither(ctx, size, intensity)
      break
    case 'holographic':
      applyChromaticAberration(ctx, size, intensity)
      applyScanlines(ctx, size, intensity * 0.3)
      break
    case 'none':
    default:
      break
  }
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

export function renderBlokr(traits: BlokrTraits): Buffer {
  const size = CONFIG.imageSize
  const pixelSize = CONFIG.pixelSize

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // 1. Render background
  renderBackground(ctx, size, traits.background, traits.palette)

  // 2. Generate and render shapes based on composition
  const placements = generateComposition(traits, size, pixelSize)

  placements.forEach(placement => {
    renderShape(
      ctx,
      placement.grid,
      placement.x,
      placement.y,
      pixelSize,
      placement.color,
      traits.mutation
    )
  })

  // 3. Apply effects
  applyEffect(ctx, canvas, size, traits.effect, traits.effectIntensity, traits.palette)

  // 4. Return PNG buffer
  return canvas.toBuffer('image/png')
}
