import { createCanvas } from 'canvas'
import * as fs from 'fs'
import { PerlinNoise, runCellularAutomata } from './noise'

const BRAND_LIME = '#CEFD00'
const WIDTH = 1500
const HEIGHT = 500

// Robinhood-inspired palette
const PALETTE = [
  '#CEFD00', // Lime (primary)
  '#A8D900', // Darker lime
  '#E5FF4D', // Light lime
  '#1A1A1A', // Dark
  '#2D2D2D', // Dark gray
  '#0D0D0D', // Near black
  '#CEFD00', // Extra lime for dominance
]

class SeededRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed }
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }
  pick<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)] }
}

function generateBanner(seed: number = Date.now()): Buffer {
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')
  const rng = new SeededRandom(seed)
  const noise = new PerlinNoise(seed)
  
  // Dark background
  ctx.fillStyle = '#0A0A0A'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  
  const blockSize = 20
  const cols = Math.ceil(WIDTH / blockSize)
  const rows = Math.ceil(HEIGHT / blockSize)
  
  // Layer 1: Noise-based blocks
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = noise.fbm(x * 0.08, y * 0.08, 3)
      if (n > 0.1) {
        const alpha = Math.min(1, (n + 0.5) * 0.6)
        ctx.fillStyle = rng.pick(PALETTE)
        ctx.globalAlpha = alpha * 0.3
        ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1)
      }
    }
  }
  
  ctx.globalAlpha = 1
  
  // Layer 2: Cellular automata patterns
  const cellGrid = runCellularAutomata(cols, rows, 'caves', 4, 0.45, seed)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (cellGrid[y]?.[x]) {
        ctx.fillStyle = rng.next() > 0.7 ? BRAND_LIME : rng.pick(['#1A1A1A', '#2D2D2D'])
        ctx.globalAlpha = 0.4
        ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1)
      }
    }
  }
  
  ctx.globalAlpha = 1
  
  // Layer 3: Stacked block columns
  const numColumns = 30 + Math.floor(rng.next() * 20)
  for (let i = 0; i < numColumns; i++) {
    const colX = Math.floor(rng.next() * cols)
    const colHeight = 3 + Math.floor(rng.next() * 8)
    const startY = rows - colHeight
    
    for (let j = 0; j < colHeight; j++) {
      const isLime = rng.next() > 0.5
      ctx.fillStyle = isLime ? BRAND_LIME : rng.pick(['#A8D900', '#E5FF4D', '#1A1A1A'])
      ctx.globalAlpha = 0.7 + rng.next() * 0.3
      ctx.fillRect(colX * blockSize, (startY + j) * blockSize, blockSize - 1, blockSize - 1)
      
      // Highlight
      if (isLime) {
        ctx.fillStyle = '#FFFFFF'
        ctx.globalAlpha = 0.3
        ctx.fillRect(colX * blockSize, (startY + j) * blockSize, blockSize - 1, 3)
      }
    }
  }
  
  ctx.globalAlpha = 1
  
  // Layer 4: Floating blocks (tetris-like)
  const numFloating = 40 + Math.floor(rng.next() * 30)
  for (let i = 0; i < numFloating; i++) {
    const bx = Math.floor(rng.next() * cols)
    const by = Math.floor(rng.next() * rows)
    const bw = 1 + Math.floor(rng.next() * 3)
    const bh = 1 + Math.floor(rng.next() * 2)
    
    const isLime = rng.next() > 0.4
    ctx.fillStyle = isLime ? BRAND_LIME : rng.pick(PALETTE)
    ctx.globalAlpha = 0.6 + rng.next() * 0.4
    
    for (let dy = 0; dy < bh; dy++) {
      for (let dx = 0; dx < bw; dx++) {
        ctx.fillRect((bx + dx) * blockSize, (by + dy) * blockSize, blockSize - 1, blockSize - 1)
      }
    }
    
    // 3D effect
    if (isLime) {
      ctx.fillStyle = '#FFFFFF'
      ctx.globalAlpha = 0.2
      ctx.fillRect(bx * blockSize, by * blockSize, bw * blockSize - 1, 2)
    }
  }
  
  ctx.globalAlpha = 1
  
  // Layer 5: Accent lime sparkles
  for (let i = 0; i < 100; i++) {
    const sx = Math.floor(rng.next() * WIDTH)
    const sy = Math.floor(rng.next() * HEIGHT)
    const size = 2 + Math.floor(rng.next() * 6)
    
    ctx.fillStyle = BRAND_LIME
    ctx.globalAlpha = 0.5 + rng.next() * 0.5
    ctx.fillRect(sx, sy, size, size)
  }
  
  ctx.globalAlpha = 1
  
  // Layer 6: Digital rain columns
  const numRainCols = 15
  for (let i = 0; i < numRainCols; i++) {
    const rx = Math.floor(rng.next() * cols)
    const rainLen = 5 + Math.floor(rng.next() * 10)
    const startRy = Math.floor(rng.next() * (rows - rainLen))
    
    for (let j = 0; j < rainLen; j++) {
      const fadeAlpha = 1 - (j / rainLen) * 0.7
      ctx.fillStyle = BRAND_LIME
      ctx.globalAlpha = fadeAlpha * 0.8
      ctx.fillRect(rx * blockSize, (startRy + j) * blockSize, blockSize - 1, blockSize - 1)
    }
  }
  
  ctx.globalAlpha = 1
  
  // Vignette effect
  const gradient = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 100, WIDTH/2, HEIGHT/2, WIDTH/1.5)
  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  
  return canvas.toBuffer('image/png')
}

// Generate banner
const seed = Date.now()
const buffer = generateBanner(seed)
const outputPath = './public/banner-nfts.png'
fs.writeFileSync(outputPath, buffer)
console.log(`✅ Banner saved to: ${outputPath}`)
console.log(`   Size: 1500x500`)
console.log(`   Seed: ${seed}`)
