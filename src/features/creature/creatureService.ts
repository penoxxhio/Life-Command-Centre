import type { CreatureData, CreatureStats, CreatureAnimation, EvolutionStage } from '../../types';
import {
  DECAY_RATES,
  XP_REWARDS,
  STAT_BOOSTS,
  getMood,
  getNextStage,
  getXPForNextStage,
  STAGE_ORDER,
  EVOLUTION_THRESHOLDS,
} from './creatureConfig';

// ---- Apply stat decay based on time elapsed ----
export function applyDecay(creature: CreatureData): CreatureData {
  const now = Date.now();
  const lastInteraction = new Date(creature.lastInteraction).getTime();
  const hoursElapsed = (now - lastInteraction) / (1000 * 60 * 60);

  if (hoursElapsed < 0.05) return creature; // Less than 3 min, skip

  // Cap decay at 24 hours to prevent total depletion from long absence
  const cappedHours = Math.min(hoursElapsed, 24);

  const newStats: CreatureStats = {
    hunger: Math.max(0, creature.stats.hunger - DECAY_RATES.hunger * cappedHours),
    energy: Math.max(0, creature.stats.energy - DECAY_RATES.energy * cappedHours),
    happiness: Math.max(0, creature.stats.happiness - DECAY_RATES.happiness * cappedHours),
    discipline: Math.max(0, creature.stats.discipline - DECAY_RATES.discipline * cappedHours),
  };

  const mood = getMood(newStats);

  // Determine idle animation based on time and mood
  let animation: CreatureAnimation = 'idle';
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 6) {
    animation = 'sleep';
  } else if (mood === 'sad' || mood === 'critical') {
    animation = 'sad-idle';
  } else if (mood === 'ecstatic') {
    animation = 'play';
  }

  return {
    ...creature,
    stats: newStats,
    mood,
    animation,
    lastInteraction: new Date().toISOString(),
  };
}

// ---- Process a user action: boost stats, grant XP, check evolution ----
export interface ActionResult {
  creature: CreatureData;
  xpGained: number;
  evolved: boolean;
  newStage?: EvolutionStage;
  reactionAnimation: CreatureAnimation;
}

export function processAction(
  creature: CreatureData,
  actionType: keyof typeof XP_REWARDS
): ActionResult {
  const xp = XP_REWARDS[actionType];
  const boosts = STAT_BOOSTS[actionType] || {};

  // Apply stat boosts
  const newStats: CreatureStats = {
    hunger: Math.min(100, creature.stats.hunger + (boosts.hunger || 0)),
    energy: Math.min(100, creature.stats.energy + (boosts.energy || 0)),
    happiness: Math.min(100, creature.stats.happiness + (boosts.happiness || 0)),
    discipline: Math.min(100, creature.stats.discipline + (boosts.discipline || 0)),
  };

  // Add XP
  const newXP = creature.xp + xp;

  // Check evolution
  const nextStage = getNextStage(creature.stage);
  const xpNeeded = getXPForNextStage(creature.stage);
  const evolved = nextStage !== null && newXP >= xpNeeded;

  // Pick reaction animation
  let reactionAnimation: CreatureAnimation = 'happy-bounce';
  if (actionType === 'workout-logged') reactionAnimation = 'flex';
  if (actionType === 'meal-logged') reactionAnimation = 'eat';
  if (actionType === 'expense-logged') reactionAnimation = 'nod';
  if (actionType === 'debt-payment') reactionAnimation = 'celebrate';
  if (evolved) reactionAnimation = 'evolve';

  const updatedCreature: CreatureData = {
    ...creature,
    stats: newStats,
    xp: newXP,
    mood: getMood(newStats),
    animation: reactionAnimation,
    lastInteraction: new Date().toISOString(),
    ...(evolved && nextStage
      ? {
          stage: nextStage,
          xpToNextStage: getXPForNextStage(nextStage),
          evolvedAt: [...creature.evolvedAt, new Date().toISOString()],
        }
      : {}),
    ...(actionType === 'meal-logged' ? { lastFed: new Date().toISOString() } : {}),
    ...(actionType === 'workout-logged' ? { lastTrained: new Date().toISOString() } : {}),
  };

  return {
    creature: updatedCreature,
    xpGained: xp,
    evolved,
    newStage: evolved ? nextStage! : undefined,
    reactionAnimation,
  };
}

// ---- Create initial creature ----
export function createCreature(
  species: CreatureData['species'],
  name: string
): CreatureData {
  const now = new Date().toISOString();
  return {
    species,
    name,
    stage: 'egg',
    xp: 0,
    xpToNextStage: EVOLUTION_THRESHOLDS.baby,
    stats: { hunger: 70, energy: 70, happiness: 80, discipline: 50 },
    mood: 'happy',
    animation: 'idle',
    lastFed: now,
    lastTrained: now,
    lastInteraction: now,
    evolvedAt: [],
    totalDaysAlive: 0,
    longestStreak: 0,
  };
}

// ---- Get evolution progress as percentage ----
export function getEvolutionProgress(creature: CreatureData): number {
  const currentThreshold = EVOLUTION_THRESHOLDS[creature.stage];
  const nextThreshold = getXPForNextStage(creature.stage);
  if (nextThreshold === Infinity) return 100;
  const range = nextThreshold - currentThreshold;
  const progress = creature.xp - currentThreshold;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

// ---- Get stage index for display ----
export function getStageIndex(stage: EvolutionStage): number {
  return STAGE_ORDER.indexOf(stage);
}
