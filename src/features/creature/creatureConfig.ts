import type { CreatureSpecies, EvolutionStage, CreatureMood } from '../../types';

// ---- Evolution XP thresholds ----
export const EVOLUTION_THRESHOLDS: Record<EvolutionStage, number> = {
  egg: 0,
  baby: 50,
  teen: 200,
  adult: 600,
  legendary: 1500,
};

export const STAGE_ORDER: EvolutionStage[] = ['egg', 'baby', 'teen', 'adult', 'legendary'];

export function getNextStage(current: EvolutionStage): EvolutionStage | null {
  const idx = STAGE_ORDER.indexOf(current);
  return idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
}

export function getXPForNextStage(current: EvolutionStage): number {
  const next = getNextStage(current);
  return next ? EVOLUTION_THRESHOLDS[next] : Infinity;
}

// ---- Stat decay rates (per hour) ----
export const DECAY_RATES = {
  hunger: 2.5,       // loses 2.5/hr — need to log meals
  energy: 1.8,       // loses 1.8/hr — need to log sleep/rest
  happiness: 2.0,    // loses 2.0/hr — need general activity
  discipline: 1.2,   // loses 1.2/hr — need to track expenses
};

// ---- XP rewards per action ----
export const XP_REWARDS = {
  'meal-logged': 8,
  'workout-logged': 15,
  'expense-logged': 6,
  'debt-payment': 20,
  'streak-bonus': 25,
  'budget-met': 30,
};

// ---- Stat boosts per action ----
export const STAT_BOOSTS: Record<string, Partial<Record<keyof typeof DECAY_RATES, number>>> = {
  'meal-logged': { hunger: 25, happiness: 5 },
  'workout-logged': { energy: 20, happiness: 15 },
  'expense-logged': { discipline: 20, happiness: 5 },
  'debt-payment': { discipline: 30, happiness: 10 },
  'streak-bonus': { happiness: 25 },
  'budget-met': { discipline: 25, happiness: 15 },
};

// ---- Mood thresholds (average of all stats) ----
export function getMood(stats: { hunger: number; energy: number; happiness: number; discipline: number }): CreatureMood {
  const avg = (stats.hunger + stats.energy + stats.happiness + stats.discipline) / 4;
  if (avg >= 80) return 'ecstatic';
  if (avg >= 60) return 'happy';
  if (avg >= 40) return 'neutral';
  if (avg >= 20) return 'sad';
  return 'critical';
}

// ---- Species visual config ----
export interface SpeciesVisual {
  name: string;
  emoji: string;
  color: string;
  glowColor: string;
  description: string;
  stageEmojis: Record<EvolutionStage, string>;
  stageSizes: Record<EvolutionStage, number>;
}

export const SPECIES_CONFIG: Record<CreatureSpecies, SpeciesVisual> = {
  fox: {
    name: 'Ember Fox',
    emoji: '\uD83E\uDD8A',
    color: '#ff7b26',
    glowColor: 'rgba(255, 123, 38, 0.4)',
    description: 'Quick and clever. Thrives on consistency.',
    stageEmojis: { egg: '\uD83E\uDD5A', baby: '\uD83E\uDD8A', teen: '\uD83E\uDD8A', adult: '\uD83E\uDD8A', legendary: '\uD83E\uDD8A' },
    stageSizes: { egg: 40, baby: 56, teen: 72, adult: 88, legendary: 104 },
  },
  dragon: {
    name: 'Void Dragon',
    emoji: '\uD83D\uDC09',
    color: '#8626ff',
    glowColor: 'rgba(134, 38, 255, 0.4)',
    description: 'Powerful and disciplined. Grows through strength.',
    stageEmojis: { egg: '\uD83E\uDD5A', baby: '\uD83D\uDC32', teen: '\uD83D\uDC32', adult: '\uD83D\uDC09', legendary: '\uD83D\uDC09' },
    stageSizes: { egg: 40, baby: 56, teen: 72, adult: 88, legendary: 104 },
  },
  cat: {
    name: 'Neon Cat',
    emoji: '\uD83D\uDC31',
    color: '#00d4ff',
    glowColor: 'rgba(0, 212, 255, 0.4)',
    description: 'Independent and smart. Rewards balanced living.',
    stageEmojis: { egg: '\uD83E\uDD5A', baby: '\uD83D\uDC31', teen: '\uD83D\uDC08', adult: '\uD83D\uDC08', legendary: '\uD83D\uDC08' },
    stageSizes: { egg: 40, baby: 56, teen: 72, adult: 88, legendary: 104 },
  },
  owl: {
    name: 'Astral Owl',
    emoji: '\uD83E\uDD89',
    color: '#ffc000',
    glowColor: 'rgba(255, 192, 0, 0.4)',
    description: 'Wise and watchful. Thrives on knowledge and routine.',
    stageEmojis: { egg: '\uD83E\uDD5A', baby: '\uD83D\uDC24', teen: '\uD83E\uDD89', adult: '\uD83E\uDD89', legendary: '\uD83E\uDD89' },
    stageSizes: { egg: 40, baby: 56, teen: 72, adult: 88, legendary: 104 },
  },
  wolf: {
    name: 'Shadow Wolf',
    emoji: '\uD83D\uDC3A',
    color: '#9ea4ba',
    glowColor: 'rgba(158, 164, 186, 0.4)',
    description: 'Loyal and fierce. Gains power from discipline.',
    stageEmojis: { egg: '\uD83E\uDD5A', baby: '\uD83D\uDC15', teen: '\uD83D\uDC3A', adult: '\uD83D\uDC3A', legendary: '\uD83D\uDC3A' },
    stageSizes: { egg: 40, baby: 56, teen: 72, adult: 88, legendary: 104 },
  },
};

// ---- Mood expressions (text-based for each mood) ----
export const MOOD_EXPRESSIONS: Record<CreatureMood, { face: string; message: string }> = {
  ecstatic: { face: '\u2728', message: 'Feeling amazing!' },
  happy: { face: '\uD83D\uDE0A', message: 'Life is good~' },
  neutral: { face: '\uD83D\uDE10', message: 'Could use some attention...' },
  sad: { face: '\uD83D\uDE22', message: 'Please take care of me...' },
  critical: { face: '\uD83D\uDE35', message: 'I need help!' },
};

// ---- Stage descriptions ----
export const STAGE_DESCRIPTIONS: Record<EvolutionStage, string> = {
  egg: 'A mysterious egg full of potential. Keep being consistent to hatch it!',
  baby: 'Your creature has hatched! It\'s small but eager to grow.',
  teen: 'Growing fast! Your creature is developing its unique abilities.',
  adult: 'Fully grown and powerful. Your dedication has paid off.',
  legendary: 'LEGENDARY status! Your creature radiates with otherworldly energy.',
};
