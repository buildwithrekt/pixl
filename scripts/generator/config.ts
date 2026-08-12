// ============================================
// BLOKR NFT GENERATOR - CONFIGURATION
// ============================================

export const CONFIG = {
  // Output settings
  totalSupply: 2048,
  imageSize: 1024, // px
  pixelSize: 32, // Each "pixel" block is 32x32 actual pixels (32x32 grid)
  gridSize: 32, // 32x32 grid of blocks

  outputDir: './output',
  imagesDir: './output/images',
  metadataDir: './output/metadata',

  // Collection info
  name: 'Blokr',
  description: 'Silent guardians of the grid. Born from the first pixels ever minted on Robinhood Chain.',
  externalUrl: 'https://blokr.io',

  // Rarity weights (higher = more common)
  rarityWeights: {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1,
  },
}

// ============================================
// COLOR PALETTES
// ============================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface ColorPalette {
  name: string
  rarity: Rarity
  background: string
  primary: string
  secondary: string
  accent: string
  glow?: string
}

export const PALETTES: ColorPalette[] = [
  // COMMON (50%)
  { name: 'Lime Core', rarity: 'common', background: '#BFFF00', primary: '#000000', secondary: '#1a1a1a', accent: '#333333' },
  { name: 'Midnight', rarity: 'common', background: '#0a0a0a', primary: '#BFFF00', secondary: '#8BC34A', accent: '#4CAF50' },
  { name: 'Arctic', rarity: 'common', background: '#E8F5F5', primary: '#1a1a1a', secondary: '#2d3436', accent: '#636e72' },
  { name: 'Slate', rarity: 'common', background: '#2d3436', primary: '#dfe6e9', secondary: '#b2bec3', accent: '#636e72' },
  { name: 'Moss', rarity: 'common', background: '#1e272e', primary: '#A3CB38', secondary: '#009432', accent: '#006266' },
  { name: 'Storm', rarity: 'common', background: '#2f3640', primary: '#f5f6fa', secondary: '#7f8fa6', accent: '#353b48' },
  { name: 'Carbon', rarity: 'common', background: '#1e1e1e', primary: '#4ecca3', secondary: '#36a386', accent: '#232931' },
  { name: 'Paper', rarity: 'common', background: '#FAF5EA', primary: '#17150F', secondary: '#3d3a33', accent: '#6b675b' },

  // UNCOMMON (30%)
  { name: 'Neon Streets', rarity: 'uncommon', background: '#0f0f23', primary: '#ff00ff', secondary: '#00ffff', accent: '#ffff00' },
  { name: 'Sunset', rarity: 'uncommon', background: '#2d1b3d', primary: '#ff6b6b', secondary: '#feca57', accent: '#ff9ff3' },
  { name: 'Ocean Deep', rarity: 'uncommon', background: '#0c2461', primary: '#0abde3', secondary: '#48dbfb', accent: '#c8d6e5' },
  { name: 'Volcanic', rarity: 'uncommon', background: '#1a0a0a', primary: '#ff4d4d', secondary: '#ff8c00', accent: '#ffd700' },
  { name: 'Toxic', rarity: 'uncommon', background: '#0a1a0a', primary: '#39ff14', secondary: '#00ff00', accent: '#7fff00' },
  { name: 'Infrared', rarity: 'uncommon', background: '#1a0a1a', primary: '#ff1493', secondary: '#ff69b4', accent: '#ffb6c1' },

  // RARE (15%)
  { name: 'Hologram', rarity: 'rare', background: '#0a0a1a', primary: '#00ffff', secondary: '#ff00ff', accent: '#ffff00', glow: '#00ffff' },
  { name: 'Matrix', rarity: 'rare', background: '#000000', primary: '#00ff00', secondary: '#008000', accent: '#003300', glow: '#00ff00' },
  { name: 'Plasma', rarity: 'rare', background: '#1a0520', primary: '#e056fd', secondary: '#be2edd', accent: '#8e44ad', glow: '#e056fd' },
  { name: 'Aurora', rarity: 'rare', background: '#051937', primary: '#00d4ff', secondary: '#7b2cbf', accent: '#ff006e', glow: '#00d4ff' },

  // EPIC (4%)
  { name: 'Void Crystal', rarity: 'epic', background: '#000000', primary: '#ffffff', secondary: '#a855f7', accent: '#6366f1', glow: '#a855f7' },
  { name: 'Solar Flare', rarity: 'epic', background: '#0a0000', primary: '#ffd700', secondary: '#ff4500', accent: '#ff0000', glow: '#ffd700' },
  { name: 'Quantum', rarity: 'epic', background: '#020024', primary: '#00f5ff', secondary: '#ff00ff', accent: '#ffff00', glow: '#00f5ff' },

  // LEGENDARY (1%)
  { name: 'Genesis', rarity: 'legendary', background: '#000000', primary: '#BFFF00', secondary: '#ffffff', accent: '#ffd700', glow: '#BFFF00' },
  { name: 'Singularity', rarity: 'legendary', background: '#000000', primary: '#ffffff', secondary: '#000000', accent: '#BFFF00', glow: '#ffffff' },
]

// ============================================
// BACKGROUND PATTERNS
// ============================================

export type BackgroundType = 'solid' | 'gradient' | 'noise' | 'grid' | 'dots' | 'scanlines' | 'circuit' | 'radial'

export interface BackgroundConfig {
  type: BackgroundType
  rarity: Rarity
  weight: number
}

export const BACKGROUNDS: BackgroundConfig[] = [
  { type: 'solid', rarity: 'common', weight: 35 },
  { type: 'gradient', rarity: 'common', weight: 25 },
  { type: 'noise', rarity: 'uncommon', weight: 15 },
  { type: 'grid', rarity: 'uncommon', weight: 10 },
  { type: 'dots', rarity: 'rare', weight: 6 },
  { type: 'scanlines', rarity: 'rare', weight: 4 },
  { type: 'circuit', rarity: 'epic', weight: 3 },
  { type: 'radial', rarity: 'epic', weight: 2 },
]

// ============================================
// SHAPE PRIMITIVES
// ============================================

export type ShapeType =
  | 'square' | 'rectangle' | 'triangle' | 'diamond'
  | 'cross' | 'plus' | 'circle' | 'ring'
  | 'arrow' | 'chevron' | 'zigzag' | 'wave'
  | 'tower' | 'pyramid' | 'stairs' | 'blocks'
  | 'face' | 'skull' | 'crown' | 'gem'

export interface ShapeConfig {
  type: ShapeType
  rarity: Rarity
  weight: number
  category: 'geometric' | 'structural' | 'iconic'
}

export const SHAPES: ShapeConfig[] = [
  // Geometric (common)
  { type: 'square', rarity: 'common', weight: 15, category: 'geometric' },
  { type: 'rectangle', rarity: 'common', weight: 12, category: 'geometric' },
  { type: 'triangle', rarity: 'common', weight: 10, category: 'geometric' },
  { type: 'diamond', rarity: 'common', weight: 10, category: 'geometric' },
  { type: 'cross', rarity: 'common', weight: 8, category: 'geometric' },
  { type: 'plus', rarity: 'common', weight: 8, category: 'geometric' },

  // Structural (uncommon)
  { type: 'circle', rarity: 'uncommon', weight: 7, category: 'geometric' },
  { type: 'ring', rarity: 'uncommon', weight: 5, category: 'geometric' },
  { type: 'arrow', rarity: 'uncommon', weight: 5, category: 'structural' },
  { type: 'chevron', rarity: 'uncommon', weight: 4, category: 'structural' },
  { type: 'tower', rarity: 'uncommon', weight: 4, category: 'structural' },
  { type: 'stairs', rarity: 'uncommon', weight: 3, category: 'structural' },

  // Complex (rare)
  { type: 'zigzag', rarity: 'rare', weight: 2, category: 'structural' },
  { type: 'wave', rarity: 'rare', weight: 2, category: 'structural' },
  { type: 'pyramid', rarity: 'rare', weight: 2, category: 'structural' },
  { type: 'blocks', rarity: 'rare', weight: 2, category: 'structural' },

  // Iconic (epic/legendary)
  { type: 'face', rarity: 'epic', weight: 1, category: 'iconic' },
  { type: 'skull', rarity: 'epic', weight: 0.5, category: 'iconic' },
  { type: 'crown', rarity: 'legendary', weight: 0.3, category: 'iconic' },
  { type: 'gem', rarity: 'legendary', weight: 0.2, category: 'iconic' },
]

// ============================================
// COMPOSITION STYLES
// ============================================

export type CompositionType =
  | 'centered' | 'scattered' | 'spiral' | 'radial'
  | 'grid' | 'diagonal' | 'layered' | 'fractal'
  | 'symmetrical' | 'asymmetrical' | 'clustered' | 'orbital'

export interface CompositionConfig {
  type: CompositionType
  rarity: Rarity
  weight: number
  shapesCount: [number, number] // min, max shapes
}

export const COMPOSITIONS: CompositionConfig[] = [
  { type: 'centered', rarity: 'common', weight: 20, shapesCount: [1, 3] },
  { type: 'scattered', rarity: 'common', weight: 18, shapesCount: [4, 8] },
  { type: 'grid', rarity: 'common', weight: 15, shapesCount: [4, 9] },
  { type: 'diagonal', rarity: 'uncommon', weight: 12, shapesCount: [2, 5] },
  { type: 'layered', rarity: 'uncommon', weight: 10, shapesCount: [3, 6] },
  { type: 'symmetrical', rarity: 'uncommon', weight: 8, shapesCount: [2, 4] },
  { type: 'radial', rarity: 'rare', weight: 6, shapesCount: [5, 12] },
  { type: 'spiral', rarity: 'rare', weight: 4, shapesCount: [6, 15] },
  { type: 'fractal', rarity: 'epic', weight: 3, shapesCount: [8, 20] },
  { type: 'clustered', rarity: 'epic', weight: 2, shapesCount: [10, 25] },
  { type: 'orbital', rarity: 'legendary', weight: 1.5, shapesCount: [6, 12] },
  { type: 'asymmetrical', rarity: 'legendary', weight: 0.5, shapesCount: [3, 7] },
]

// ============================================
// EFFECTS
// ============================================

export type EffectType =
  | 'none' | 'glow' | 'shadow' | 'outline'
  | 'noise' | 'scanlines' | 'glitch' | 'chromatic'
  | 'pixelate' | 'dither' | 'crt' | 'holographic'

export interface EffectConfig {
  type: EffectType
  rarity: Rarity
  weight: number
  intensity: [number, number] // min, max
}

export const EFFECTS: EffectConfig[] = [
  { type: 'none', rarity: 'common', weight: 30, intensity: [0, 0] },
  { type: 'shadow', rarity: 'common', weight: 20, intensity: [0.3, 0.6] },
  { type: 'outline', rarity: 'common', weight: 15, intensity: [0.5, 1] },
  { type: 'glow', rarity: 'uncommon', weight: 12, intensity: [0.3, 0.8] },
  { type: 'noise', rarity: 'uncommon', weight: 8, intensity: [0.1, 0.3] },
  { type: 'scanlines', rarity: 'rare', weight: 5, intensity: [0.2, 0.5] },
  { type: 'dither', rarity: 'rare', weight: 4, intensity: [0.3, 0.7] },
  { type: 'glitch', rarity: 'epic', weight: 3, intensity: [0.2, 0.6] },
  { type: 'chromatic', rarity: 'epic', weight: 2, intensity: [0.1, 0.4] },
  { type: 'crt', rarity: 'legendary', weight: 0.7, intensity: [0.4, 0.8] },
  { type: 'holographic', rarity: 'legendary', weight: 0.3, intensity: [0.5, 1] },
]

// ============================================
// MUTATIONS
// ============================================

export type MutationType =
  | 'none' | 'mirror_h' | 'mirror_v' | 'mirror_both'
  | 'rotate_90' | 'rotate_180' | 'rotate_270'
  | 'invert' | 'shift' | 'stretch' | 'compress'

export interface MutationConfig {
  type: MutationType
  rarity: Rarity
  weight: number
}

export const MUTATIONS: MutationConfig[] = [
  { type: 'none', rarity: 'common', weight: 40 },
  { type: 'mirror_h', rarity: 'common', weight: 15 },
  { type: 'mirror_v', rarity: 'common', weight: 10 },
  { type: 'rotate_180', rarity: 'uncommon', weight: 10 },
  { type: 'rotate_90', rarity: 'uncommon', weight: 7 },
  { type: 'rotate_270', rarity: 'uncommon', weight: 5 },
  { type: 'mirror_both', rarity: 'rare', weight: 5 },
  { type: 'shift', rarity: 'rare', weight: 3 },
  { type: 'invert', rarity: 'epic', weight: 3 },
  { type: 'stretch', rarity: 'epic', weight: 1.5 },
  { type: 'compress', rarity: 'legendary', weight: 0.5 },
]

// ============================================
// SPECIAL TRAITS
// ============================================

export type SpecialTrait =
  | 'none' | 'animated' | 'reactive' | 'evolving'
  | 'one_of_one' | 'genesis' | 'corrupted' | 'void'

export interface SpecialTraitConfig {
  type: SpecialTrait
  rarity: Rarity
  weight: number
  description: string
}

export const SPECIAL_TRAITS: SpecialTraitConfig[] = [
  { type: 'none', rarity: 'common', weight: 90, description: 'Standard Blokr' },
  { type: 'animated', rarity: 'rare', weight: 4, description: '2-frame animation cycle' },
  { type: 'corrupted', rarity: 'rare', weight: 3, description: 'Glitched data artifacts' },
  { type: 'reactive', rarity: 'epic', weight: 1.5, description: 'Responds to chain activity' },
  { type: 'void', rarity: 'epic', weight: 1, description: 'Born from empty blocks' },
  { type: 'evolving', rarity: 'legendary', weight: 0.3, description: 'Changes over time' },
  { type: 'genesis', rarity: 'legendary', weight: 0.15, description: 'First generation Blokr' },
  { type: 'one_of_one', rarity: 'legendary', weight: 0.05, description: 'Unique masterpiece' },
]
