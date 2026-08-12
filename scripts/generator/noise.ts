// ============================================
// BLOKR NFT GENERATOR - NOISE & PROCEDURAL
// ============================================

// Simple Perlin-like noise implementation
export class PerlinNoise {
  private permutation: number[]

  constructor(seed: number = Math.random() * 10000) {
    this.permutation = this.generatePermutation(seed)
  }

  private generatePermutation(seed: number): number[] {
    const perm = Array.from({ length: 256 }, (_, i) => i)

    // Seeded shuffle
    let s = seed
    for (let i = 255; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff
      const j = s % (i + 1)
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
    }

    return [...perm, ...perm]
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    x -= Math.floor(x)
    y -= Math.floor(y)

    const u = this.fade(x)
    const v = this.fade(y)

    const A = this.permutation[X] + Y
    const B = this.permutation[X + 1] + Y

    return this.lerp(
      this.lerp(
        this.grad(this.permutation[A], x, y),
        this.grad(this.permutation[B], x - 1, y),
        u
      ),
      this.lerp(
        this.grad(this.permutation[A + 1], x, y - 1),
        this.grad(this.permutation[B + 1], x - 1, y - 1),
        u
      ),
      v
    )
  }

  // Fractal Brownian Motion - more organic noise
  fbm(x: number, y: number, octaves: number = 4, lacunarity: number = 2, persistence: number = 0.5): number {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2D(x * frequency, y * frequency)
      maxValue += amplitude
      amplitude *= persistence
      frequency *= lacunarity
    }

    return value / maxValue
  }

  // Turbulence - absolute value noise
  turbulence(x: number, y: number, octaves: number = 4): number {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      value += amplitude * Math.abs(this.noise2D(x * frequency, y * frequency))
      maxValue += amplitude
      amplitude *= 0.5
      frequency *= 2
    }

    return value / maxValue
  }

  // Ridge noise - inverted absolute
  ridge(x: number, y: number, octaves: number = 4): number {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      const n = 1 - Math.abs(this.noise2D(x * frequency, y * frequency))
      value += amplitude * n * n
      maxValue += amplitude
      amplitude *= 0.5
      frequency *= 2
    }

    return value / maxValue
  }
}

// ============================================
// CELLULAR AUTOMATA
// ============================================

export type CellRule = 'conway' | 'maze' | 'coral' | 'crystals' | 'caves'

export function runCellularAutomata(
  width: number,
  height: number,
  rule: CellRule,
  iterations: number,
  initialDensity: number = 0.4,
  seed: number = Date.now()
): boolean[][] {
  // Initialize grid
  let grid: boolean[][] = []
  let rng = seed

  const random = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff
    return rng / 0x7fffffff
  }

  for (let y = 0; y < height; y++) {
    grid[y] = []
    for (let x = 0; x < width; x++) {
      grid[y][x] = random() < initialDensity
    }
  }

  // Run iterations
  for (let iter = 0; iter < iterations; iter++) {
    const newGrid: boolean[][] = []

    for (let y = 0; y < height; y++) {
      newGrid[y] = []
      for (let x = 0; x < width; x++) {
        const neighbors = countNeighbors(grid, x, y, width, height)
        newGrid[y][x] = applyRule(grid[y][x], neighbors, rule)
      }
    }

    grid = newGrid
  }

  return grid
}

function countNeighbors(grid: boolean[][], x: number, y: number, width: number, height: number): number {
  let count = 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const nx = (x + dx + width) % width
      const ny = (y + dy + height) % height
      if (grid[ny][nx]) count++
    }
  }
  return count
}

function applyRule(alive: boolean, neighbors: number, rule: CellRule): boolean {
  switch (rule) {
    case 'conway':
      // B3/S23 - Conway's Game of Life
      if (alive) return neighbors === 2 || neighbors === 3
      return neighbors === 3

    case 'maze':
      // B3/S12345 - Creates maze-like patterns
      if (alive) return neighbors >= 1 && neighbors <= 5
      return neighbors === 3

    case 'coral':
      // B3/S45678 - Coral-like growth
      if (alive) return neighbors >= 4
      return neighbors === 3

    case 'crystals':
      // B1357/S1357 - Crystal growth
      if (alive) return neighbors % 2 === 1
      return neighbors % 2 === 1

    case 'caves':
      // B5678/S45678 - Cave-like structures
      if (alive) return neighbors >= 4
      return neighbors >= 5

    default:
      return alive
  }
}

// ============================================
// L-SYSTEM
// ============================================

export interface LSystemRule {
  symbol: string
  replacement: string
}

export function generateLSystem(
  axiom: string,
  rules: LSystemRule[],
  iterations: number
): string {
  let current = axiom

  for (let i = 0; i < iterations; i++) {
    let next = ''
    for (const char of current) {
      const rule = rules.find(r => r.symbol === char)
      next += rule ? rule.replacement : char
    }
    current = next
  }

  return current
}

export interface LSystemPoint {
  x: number
  y: number
}

export function interpretLSystem(
  system: string,
  startX: number,
  startY: number,
  angle: number = 0,
  stepSize: number = 1,
  turnAngle: number = Math.PI / 4
): LSystemPoint[] {
  const points: LSystemPoint[] = [{ x: startX, y: startY }]
  let x = startX
  let y = startY
  let currentAngle = angle
  const stack: { x: number; y: number; angle: number }[] = []

  for (const char of system) {
    switch (char) {
      case 'F':
      case 'G':
        x += Math.cos(currentAngle) * stepSize
        y += Math.sin(currentAngle) * stepSize
        points.push({ x, y })
        break
      case '+':
        currentAngle += turnAngle
        break
      case '-':
        currentAngle -= turnAngle
        break
      case '[':
        stack.push({ x, y, angle: currentAngle })
        break
      case ']':
        const state = stack.pop()
        if (state) {
          x = state.x
          y = state.y
          currentAngle = state.angle
        }
        break
    }
  }

  return points
}

// ============================================
// PARTICLE SYSTEM
// ============================================

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: number // 0-1 for color interpolation
}

export function createParticleSystem(
  count: number,
  width: number,
  height: number,
  seed: number = Date.now()
): Particle[] {
  const particles: Particle[] = []
  let rng = seed

  const random = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff
    return rng / 0x7fffffff
  }

  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2
    const speed = random() * 2 + 0.5
    const maxLife = Math.floor(random() * 50) + 20

    particles.push({
      x: random() * width,
      y: random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
      size: random() * 3 + 1,
      color: random(),
    })
  }

  return particles
}

export function simulateParticles(
  particles: Particle[],
  width: number,
  height: number,
  steps: number,
  gravity: number = 0,
  friction: number = 0.99
): Particle[][] {
  const frames: Particle[][] = [particles.map(p => ({ ...p }))]

  let current = particles.map(p => ({ ...p }))

  for (let step = 0; step < steps; step++) {
    current = current
      .filter(p => p.life > 0)
      .map(p => {
        const newP = { ...p }
        newP.x += newP.vx
        newP.y += newP.vy
        newP.vy += gravity
        newP.vx *= friction
        newP.vy *= friction
        newP.life--

        // Bounce off edges
        if (newP.x < 0 || newP.x >= width) newP.vx *= -0.8
        if (newP.y < 0 || newP.y >= height) newP.vy *= -0.8

        newP.x = Math.max(0, Math.min(width - 1, newP.x))
        newP.y = Math.max(0, Math.min(height - 1, newP.y))

        return newP
      })

    frames.push(current.map(p => ({ ...p })))
  }

  return frames
}

// ============================================
// VORONOI DIAGRAM
// ============================================

export interface VoronoiCell {
  x: number
  y: number
  color: number
}

export function generateVoronoi(
  width: number,
  height: number,
  pointCount: number,
  seed: number = Date.now()
): number[][] {
  let rng = seed
  const random = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff
    return rng / 0x7fffffff
  }

  // Generate random points
  const points: VoronoiCell[] = []
  for (let i = 0; i < pointCount; i++) {
    points.push({
      x: random() * width,
      y: random() * height,
      color: i,
    })
  }

  // Calculate Voronoi cells
  const grid: number[][] = []
  for (let y = 0; y < height; y++) {
    grid[y] = []
    for (let x = 0; x < width; x++) {
      let minDist = Infinity
      let closest = 0

      for (let i = 0; i < points.length; i++) {
        const dx = x - points[i].x
        const dy = y - points[i].y
        const dist = dx * dx + dy * dy

        if (dist < minDist) {
          minDist = dist
          closest = i
        }
      }

      grid[y][x] = closest
    }
  }

  return grid
}

// ============================================
// FLOW FIELD
// ============================================

export function generateFlowField(
  width: number,
  height: number,
  scale: number = 0.02,
  seed: number = Date.now()
): number[][] {
  const noise = new PerlinNoise(seed)
  const field: number[][] = []

  for (let y = 0; y < height; y++) {
    field[y] = []
    for (let x = 0; x < width; x++) {
      field[y][x] = noise.noise2D(x * scale, y * scale) * Math.PI * 2
    }
  }

  return field
}

export function traceFlowLine(
  field: number[][],
  startX: number,
  startY: number,
  steps: number,
  stepSize: number = 1
): LSystemPoint[] {
  const points: LSystemPoint[] = []
  let x = startX
  let y = startY

  for (let i = 0; i < steps; i++) {
    points.push({ x, y })

    const gridX = Math.floor(x) % field[0].length
    const gridY = Math.floor(y) % field.length

    if (gridX < 0 || gridY < 0 || gridY >= field.length || gridX >= field[0].length) break

    const angle = field[gridY][gridX]
    x += Math.cos(angle) * stepSize
    y += Math.sin(angle) * stepSize

    if (x < 0 || x >= field[0].length || y < 0 || y >= field.length) break
  }

  return points
}
