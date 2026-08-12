// ============================================
// BLOKR NFT GENERATOR - SHAPE PRIMITIVES
// ============================================

import { ShapeType } from './config'

// A shape is defined as a 2D array of booleans (true = filled, false = empty)
// Each shape function returns the shape grid and can take size parameters

export type ShapeGrid = boolean[][]

// Utility to create empty grid
function createGrid(width: number, height: number, fill = false): ShapeGrid {
  return Array(height).fill(null).map(() => Array(width).fill(fill))
}

// ============================================
// GEOMETRIC SHAPES
// ============================================

export function drawSquare(size: number): ShapeGrid {
  return createGrid(size, size, true)
}

export function drawRectangle(width: number, height: number): ShapeGrid {
  return createGrid(width, height, true)
}

export function drawTriangle(size: number, direction: 'up' | 'down' | 'left' | 'right' = 'up'): ShapeGrid {
  const grid = createGrid(size, size)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      switch (direction) {
        case 'up':
          grid[y][x] = x >= Math.floor((size - 1) / 2) - Math.floor(y / 2) &&
                        x <= Math.floor((size - 1) / 2) + Math.floor(y / 2) &&
                        y >= size - Math.ceil(size * 0.8)
          break
        case 'down':
          grid[y][x] = x >= Math.floor(y / 2) &&
                        x < size - Math.floor(y / 2) &&
                        y < Math.ceil(size * 0.8)
          break
        case 'left':
          grid[y][x] = y >= Math.floor(x / 2) &&
                        y < size - Math.floor(x / 2) &&
                        x < Math.ceil(size * 0.8)
          break
        case 'right':
          grid[y][x] = y >= Math.floor((size - 1 - x) / 2) &&
                        y < size - Math.floor((size - 1 - x) / 2) &&
                        x >= size - Math.ceil(size * 0.8)
          break
      }
    }
  }
  return grid
}

export function drawDiamond(size: number): ShapeGrid {
  const grid = createGrid(size, size)
  const mid = Math.floor(size / 2)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distFromCenter = Math.abs(x - mid) + Math.abs(y - mid)
      grid[y][x] = distFromCenter <= mid
    }
  }
  return grid
}

export function drawCross(size: number, thickness: number = Math.max(1, Math.floor(size / 3))): ShapeGrid {
  const grid = createGrid(size, size)
  const start = Math.floor((size - thickness) / 2)
  const end = start + thickness

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Diagonal cross
      const onDiag1 = Math.abs(x - y) < thickness
      const onDiag2 = Math.abs(x - (size - 1 - y)) < thickness
      grid[y][x] = onDiag1 || onDiag2
    }
  }
  return grid
}

export function drawPlus(size: number, thickness: number = Math.max(1, Math.floor(size / 3))): ShapeGrid {
  const grid = createGrid(size, size)
  const start = Math.floor((size - thickness) / 2)
  const end = start + thickness

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      grid[y][x] = (x >= start && x < end) || (y >= start && y < end)
    }
  }
  return grid
}

export function drawCircle(size: number): ShapeGrid {
  const grid = createGrid(size, size)
  const center = (size - 1) / 2
  const radius = size / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2)
      grid[y][x] = dist <= radius
    }
  }
  return grid
}

export function drawRing(size: number, thickness: number = Math.max(1, Math.floor(size / 4))): ShapeGrid {
  const grid = createGrid(size, size)
  const center = (size - 1) / 2
  const outerRadius = size / 2
  const innerRadius = outerRadius - thickness

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2)
      grid[y][x] = dist <= outerRadius && dist >= innerRadius
    }
  }
  return grid
}

// ============================================
// STRUCTURAL SHAPES
// ============================================

export function drawArrow(size: number, direction: 'up' | 'down' | 'left' | 'right' = 'up'): ShapeGrid {
  const grid = createGrid(size, size)
  const mid = Math.floor(size / 2)
  const headSize = Math.floor(size * 0.5)
  const shaftWidth = Math.max(1, Math.floor(size / 4))

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (direction === 'up') {
        // Arrow head (top half)
        if (y < headSize) {
          const spread = Math.floor((headSize - y) * size / headSize / 2)
          grid[y][x] = x >= mid - spread && x <= mid + spread
        }
        // Shaft
        else {
          grid[y][x] = x >= mid - Math.floor(shaftWidth / 2) && x <= mid + Math.floor(shaftWidth / 2)
        }
      }
    }
  }
  return grid
}

export function drawChevron(size: number, thickness: number = Math.max(1, Math.floor(size / 4))): ShapeGrid {
  const grid = createGrid(size, size)
  const mid = Math.floor(size / 2)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // V shape pointing down
      const target = y < mid ? mid - y : y - mid
      grid[y][x] = Math.abs(x - mid) >= target - thickness && Math.abs(x - mid) <= target
    }
  }
  return grid
}

export function drawTower(width: number, height: number): ShapeGrid {
  const grid = createGrid(width, height)
  const levels = Math.floor(Math.random() * 3) + 2

  for (let level = 0; level < levels; level++) {
    const levelHeight = Math.floor(height / levels)
    const yStart = level * levelHeight
    const yEnd = (level + 1) * levelHeight
    const shrink = level * Math.floor(width / (levels * 3))

    for (let y = yStart; y < yEnd && y < height; y++) {
      for (let x = shrink; x < width - shrink; x++) {
        grid[y][x] = true
      }
    }
  }
  return grid
}

export function drawStairs(size: number, steps: number = 4): ShapeGrid {
  const grid = createGrid(size, size)
  const stepHeight = Math.floor(size / steps)
  const stepWidth = Math.floor(size / steps)

  for (let step = 0; step < steps; step++) {
    const xStart = step * stepWidth
    const yStart = (steps - 1 - step) * stepHeight

    for (let y = yStart; y < size; y++) {
      for (let x = xStart; x < xStart + stepWidth && x < size; x++) {
        grid[y][x] = true
      }
    }
  }
  return grid
}

export function drawZigzag(size: number, amplitude: number = Math.floor(size / 4)): ShapeGrid {
  const grid = createGrid(size, size)
  const mid = Math.floor(size / 2)
  const thickness = Math.max(1, Math.floor(size / 6))

  for (let y = 0; y < size; y++) {
    const phase = Math.floor(y / (size / 4)) % 2
    const offset = phase === 0 ?
      Math.floor((y % (size / 4)) * amplitude / (size / 4)) :
      amplitude - Math.floor((y % (size / 4)) * amplitude / (size / 4))

    for (let x = 0; x < size; x++) {
      const target = mid + offset - amplitude / 2
      grid[y][x] = x >= target - thickness / 2 && x <= target + thickness / 2
    }
  }
  return grid
}

export function drawWave(size: number): ShapeGrid {
  const grid = createGrid(size, size)
  const amplitude = Math.floor(size / 4)
  const thickness = Math.max(2, Math.floor(size / 5))
  const mid = Math.floor(size / 2)

  for (let y = 0; y < size; y++) {
    const offset = Math.sin(y / size * Math.PI * 2) * amplitude

    for (let x = 0; x < size; x++) {
      const target = mid + offset
      grid[y][x] = Math.abs(x - target) < thickness / 2
    }
  }
  return grid
}

export function drawPyramid(size: number): ShapeGrid {
  const grid = createGrid(size, size)
  const levels = Math.floor(size / 3)

  for (let level = 0; level < levels; level++) {
    const levelHeight = Math.floor(size / levels)
    const yStart = level * levelHeight
    const yEnd = (level + 1) * levelHeight
    const shrink = level * Math.floor(size / (levels * 2.5))

    for (let y = yStart; y < yEnd && y < size; y++) {
      for (let x = shrink; x < size - shrink; x++) {
        grid[y][x] = true
      }
    }
  }
  return grid
}

export function drawBlocks(size: number, blockCount: number = 5): ShapeGrid {
  const grid = createGrid(size, size)

  for (let i = 0; i < blockCount; i++) {
    const blockSize = Math.floor(Math.random() * (size / 3)) + Math.floor(size / 6)
    const x = Math.floor(Math.random() * (size - blockSize))
    const y = Math.floor(Math.random() * (size - blockSize))

    for (let by = y; by < y + blockSize && by < size; by++) {
      for (let bx = x; bx < x + blockSize && bx < size; bx++) {
        grid[by][bx] = true
      }
    }
  }
  return grid
}

// ============================================
// ICONIC SHAPES
// ============================================

export function drawFace(size: number): ShapeGrid {
  const grid = createGrid(size, size)

  // Head outline (circle)
  const center = (size - 1) / 2
  const headRadius = size * 0.4

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2)
      if (dist <= headRadius) {
        grid[y][x] = true
      }
    }
  }

  // Eyes (cut out)
  const eyeY = Math.floor(size * 0.4)
  const eyeSize = Math.max(1, Math.floor(size / 8))
  const eyeSpacing = Math.floor(size / 5)

  for (let dy = 0; dy < eyeSize; dy++) {
    for (let dx = 0; dx < eyeSize; dx++) {
      const leftX = Math.floor(center) - eyeSpacing - Math.floor(eyeSize / 2) + dx
      const rightX = Math.floor(center) + eyeSpacing - Math.floor(eyeSize / 2) + dx
      const ey = eyeY + dy

      if (leftX >= 0 && leftX < size && ey >= 0 && ey < size) grid[ey][leftX] = false
      if (rightX >= 0 && rightX < size && ey >= 0 && ey < size) grid[ey][rightX] = false
    }
  }

  return grid
}

export function drawSkull(size: number): ShapeGrid {
  const grid = createGrid(size, size)
  const center = (size - 1) / 2

  // Skull shape (rounded top, jaw)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (y < size * 0.6) {
        // Top rounded part
        const dist = Math.sqrt((x - center) ** 2 + (y - size * 0.35) ** 2)
        grid[y][x] = dist <= size * 0.35
      } else {
        // Jaw (narrower)
        const jawWidth = size * 0.25 * (1 - (y - size * 0.6) / (size * 0.4))
        grid[y][x] = Math.abs(x - center) <= jawWidth && y < size * 0.85
      }
    }
  }

  // Eye sockets
  const eyeY = Math.floor(size * 0.35)
  const eyeSize = Math.max(2, Math.floor(size / 6))
  const eyeSpacing = Math.floor(size / 5)

  for (let dy = 0; dy < eyeSize; dy++) {
    for (let dx = 0; dx < eyeSize; dx++) {
      const leftX = Math.floor(center) - eyeSpacing + dx - Math.floor(eyeSize / 2)
      const rightX = Math.floor(center) + eyeSpacing + dx - Math.floor(eyeSize / 2)
      const ey = eyeY + dy

      if (leftX >= 0 && leftX < size) grid[ey][leftX] = false
      if (rightX >= 0 && rightX < size) grid[ey][rightX] = false
    }
  }

  // Nose hole
  const noseY = Math.floor(size * 0.5)
  const noseSize = Math.max(1, Math.floor(size / 10))
  for (let dy = 0; dy < noseSize; dy++) {
    for (let dx = 0; dx < noseSize; dx++) {
      const nx = Math.floor(center) - Math.floor(noseSize / 2) + dx
      const ny = noseY + dy
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) grid[ny][nx] = false
    }
  }

  return grid
}

export function drawCrown(size: number): ShapeGrid {
  const grid = createGrid(size, size)
  const points = 5
  const baseHeight = Math.floor(size * 0.4)

  // Base band
  for (let y = size - baseHeight; y < size; y++) {
    for (let x = Math.floor(size * 0.1); x < Math.floor(size * 0.9); x++) {
      grid[y][x] = true
    }
  }

  // Points
  const pointWidth = Math.floor(size / points)
  for (let p = 0; p < points; p++) {
    const centerX = Math.floor(size * 0.1) + Math.floor(pointWidth * (p + 0.5))
    const pointHeight = p % 2 === 0 ? Math.floor(size * 0.5) : Math.floor(size * 0.35)

    for (let y = size - baseHeight - pointHeight; y < size - baseHeight; y++) {
      const progress = (size - baseHeight - y) / pointHeight
      const width = Math.floor(pointWidth / 2 * (1 - progress * 0.7))

      for (let x = centerX - width; x <= centerX + width; x++) {
        if (x >= 0 && x < size && y >= 0) grid[y][x] = true
      }
    }
  }

  return grid
}

export function drawGem(size: number): ShapeGrid {
  const grid = createGrid(size, size)
  const center = Math.floor(size / 2)

  // Top triangular part
  const topHeight = Math.floor(size * 0.35)
  for (let y = 0; y < topHeight; y++) {
    const width = Math.floor((y / topHeight) * size * 0.4)
    for (let x = center - width; x <= center + width; x++) {
      if (x >= 0 && x < size) grid[y][x] = true
    }
  }

  // Middle widest part
  const midStart = topHeight
  const midHeight = Math.floor(size * 0.15)
  const maxWidth = Math.floor(size * 0.4)
  for (let y = midStart; y < midStart + midHeight; y++) {
    for (let x = center - maxWidth; x <= center + maxWidth; x++) {
      if (x >= 0 && x < size) grid[y][x] = true
    }
  }

  // Bottom pointed part
  const bottomStart = midStart + midHeight
  const bottomHeight = size - bottomStart
  for (let y = bottomStart; y < size; y++) {
    const progress = (y - bottomStart) / bottomHeight
    const width = Math.floor(maxWidth * (1 - progress))
    for (let x = center - width; x <= center + width; x++) {
      if (x >= 0 && x < size) grid[y][x] = true
    }
  }

  return grid
}

// ============================================
// SHAPE FACTORY
// ============================================

export function getShape(type: ShapeType, size: number): ShapeGrid {
  switch (type) {
    case 'square':
      return drawSquare(size)
    case 'rectangle':
      return drawRectangle(size, Math.floor(size * (0.5 + Math.random() * 0.5)))
    case 'triangle':
      return drawTriangle(size, ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'left' | 'right')
    case 'diamond':
      return drawDiamond(size)
    case 'cross':
      return drawCross(size)
    case 'plus':
      return drawPlus(size)
    case 'circle':
      return drawCircle(size)
    case 'ring':
      return drawRing(size)
    case 'arrow':
      return drawArrow(size)
    case 'chevron':
      return drawChevron(size)
    case 'tower':
      return drawTower(size, Math.floor(size * 1.5))
    case 'stairs':
      return drawStairs(size)
    case 'zigzag':
      return drawZigzag(size)
    case 'wave':
      return drawWave(size)
    case 'pyramid':
      return drawPyramid(size)
    case 'blocks':
      return drawBlocks(size, Math.floor(Math.random() * 5) + 3)
    case 'face':
      return drawFace(size)
    case 'skull':
      return drawSkull(size)
    case 'crown':
      return drawCrown(size)
    case 'gem':
      return drawGem(size)
    default:
      return drawSquare(size)
  }
}

// ============================================
// SHAPE TRANSFORMATIONS
// ============================================

export function mirrorHorizontal(grid: ShapeGrid): ShapeGrid {
  return grid.map(row => [...row].reverse())
}

export function mirrorVertical(grid: ShapeGrid): ShapeGrid {
  return [...grid].reverse()
}

export function rotate90(grid: ShapeGrid): ShapeGrid {
  const height = grid.length
  const width = grid[0]?.length || 0
  const result = createGrid(height, width)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      result[x][height - 1 - y] = grid[y][x]
    }
  }
  return result
}

export function rotate180(grid: ShapeGrid): ShapeGrid {
  return mirrorVertical(mirrorHorizontal(grid))
}

export function rotate270(grid: ShapeGrid): ShapeGrid {
  return rotate90(rotate90(rotate90(grid)))
}

export function invertGrid(grid: ShapeGrid): ShapeGrid {
  return grid.map(row => row.map(cell => !cell))
}
