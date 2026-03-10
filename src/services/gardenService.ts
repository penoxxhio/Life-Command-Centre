import type { GardenData, GardenActionType, GardenReward, GardenPlant } from '@/types';

const XP_REWARDS: Record<GardenActionType, number> = {
  water: 10,
  sunlight: 8,
  fertilize: 15,
  prune: 12,
};

const GROWTH_THRESHOLDS = [0, 50, 150, 300, 500];

function getGrowthStageIndex(xp: number): number {
  for (let i = GROWTH_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= GROWTH_THRESHOLDS[i]) return i;
  }
  return 0;
}

const GROWTH_STAGE_NAMES: Record<number, GardenPlant['stage']> = {
  0: 'seed',
  1: 'sprout',
  2: 'growing',
  3: 'mature',
  4: 'blooming',
};

export function processGardenAction(
  garden: GardenData,
  actionType: GardenActionType
): { garden: GardenData; reward: GardenReward | null } {
  const xpGain = XP_REWARDS[actionType];

  const updatedPlants = garden.plants.map((plant) => {
    const newXp = plant.xp + xpGain;
    const stageIndex = getGrowthStageIndex(newXp);
    const newHealth = Math.min(100, plant.health + (actionType === 'water' ? 5 : actionType === 'fertilize' ? 8 : 3));
    const newWater = actionType === 'water' ? Math.min(100, plant.water + 20) : plant.water;
    const newSunlight = actionType === 'sunlight' ? Math.min(100, plant.sunlight + 20) : plant.sunlight;

    return {
      ...plant,
      xp: newXp,
      health: newHealth,
      water: newWater,
      sunlight: newSunlight,
      growthStage: stageIndex,
      stage: GROWTH_STAGE_NAMES[stageIndex] || plant.stage,
    };
  });

  const updatedPlots = garden.plots.map((plot) => {
    if (!plot.plant) return plot;
    const updated = updatedPlants.find((p) => p.id === plot.plant!.id);
    return updated ? { ...plot, plant: updated } : plot;
  });

  const newGarden: GardenData = {
    ...garden,
    plants: updatedPlants,
    plots: updatedPlots,
    totalXp: garden.totalXp + xpGain,
    level: Math.floor((garden.totalXp + xpGain) / 100) + 1,
    sunlight: actionType === 'sunlight' ? Math.max(0, garden.sunlight - 1) : garden.sunlight,
    water: actionType === 'water' ? Math.max(0, garden.water - 1) : garden.water,
    streak: garden.streak + 1,
    lastTended: new Date().toISOString(),
  };

  const reward: GardenReward = {
    xp: xpGain,
    message: `+${xpGain} XP from ${actionType}!`,
  };

  return { garden: newGarden, reward };
}

export function processGardenDailyDecay(garden: GardenData): GardenData {
  const now = new Date();

  const decayedPlants = garden.plants.map((plant) => {
    const healthLoss = plant.water < 20 ? 10 : plant.water < 50 ? 5 : 2;
    const waterLoss = 8;
    const sunlightLoss = 5;

    return {
      ...plant,
      health: Math.max(0, plant.health - healthLoss),
      water: Math.max(0, plant.water - waterLoss),
      sunlight: Math.max(0, plant.sunlight - sunlightLoss),
    };
  });

  const decayedPlots = garden.plots.map((plot) => {
    if (!plot.plant) return plot;
    const updated = decayedPlants.find((p) => p.id === plot.plant!.id);
    return updated ? { ...plot, plant: updated } : plot;
  });

  const lastTended = garden.lastTended ? new Date(garden.lastTended) : null;
  const daysSinceLastTend = lastTended
    ? Math.floor((now.getTime() - lastTended.getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const streakBroken = daysSinceLastTend > 1;

  return {
    ...garden,
    plants: decayedPlants,
    plots: decayedPlots,
    streak: streakBroken ? 0 : garden.streak,
  };
}
