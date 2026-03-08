import { GardenData, GardenPlant, PlantStage, PlantType } from '../types';

const STAGE_THRESHOLDS: Record<PlantStage, number> = {
  seed: 0,
  sprout: 15,
  growing: 40,
  blooming: 80,
  mature: 130,
};

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'growing', 'blooming', 'mature'];

export const PLANT_CATALOG: Record<PlantType, { name: string; emoji: Record<PlantStage, string>; description: string }> = {
  sunflower: { name: 'Sunflower', emoji: { seed: '🌰', sprout: '🌱', growing: '🌿', blooming: '🌻', mature: '🌻' }, description: 'Bright and cheerful' },
  rose: { name: 'Rose', emoji: { seed: '🌰', sprout: '🌱', growing: '🪴', blooming: '🌹', mature: '🌹' }, description: 'Classic beauty' },
  cactus: { name: 'Cactus', emoji: { seed: '🌰', sprout: '🌱', growing: '🌵', blooming: '🌵', mature: '🌵' }, description: 'Tough survivor' },
  herb: { name: 'Lucky Clover', emoji: { seed: '🌰', sprout: '🌱', growing: '🌿', blooming: '🍀', mature: '🍀' }, description: 'Brings good fortune' },
  tree: { name: 'Oak Tree', emoji: { seed: '🌰', sprout: '🌱', growing: '🌿', blooming: '🌲', mature: '🌳' }, description: 'Stands the test of time' },
  tulip: { name: 'Tulip', emoji: { seed: '🌰', sprout: '🌱', growing: '🌿', blooming: '🌷', mature: '🌷' }, description: 'Elegant and vibrant' },
  cherry: { name: 'Cherry Blossom', emoji: { seed: '🌰', sprout: '🌱', growing: '🌿', blooming: '🌸', mature: '🌸' }, description: 'Ephemeral beauty' },
  palm: { name: 'Palm Tree', emoji: { seed: '🌰', sprout: '🌱', growing: '🌿', blooming: '🌴', mature: '🌴' }, description: 'Tropical vibes' },
};

export const PLANT_TYPES = Object.keys(PLANT_CATALOG) as PlantType[];

const getStageForXP = (xp: number): PlantStage => {
  for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
    if (xp >= STAGE_THRESHOLDS[STAGE_ORDER[i]]) return STAGE_ORDER[i];
  }
  return 'seed';
};

export const getPlantEmoji = (plant: GardenPlant): string => {
  if (plant.isDead) return '🥀';
  return PLANT_CATALOG[plant.type]?.emoji[plant.stage] || '🌱';
};

export const getHealthColor = (health: number): string => {
  if (health > 70) return '#2EA043';
  if (health > 40) return '#D29922';
  if (health > 15) return '#F85149';
  return '#8B0000';
};

export const getHealthLabel = (health: number): string => {
  if (health > 70) return 'Thriving';
  if (health > 40) return 'Needs care';
  if (health > 15) return 'Wilting';
  return 'Dying';
};

type ActionType = 'expense' | 'payment' | 'meal' | 'workout' | 'income';

const ACTION_REWARDS: Record<ActionType, { xp: number; health: number }> = {
  expense: { xp: 8, health: 10 },
  payment: { xp: 20, health: 20 },
  meal: { xp: 8, health: 10 },
  workout: { xp: 12, health: 15 },
  income: { xp: 5, health: 5 },
};

export const processGardenAction = (garden: GardenData, action: ActionType): GardenData => {
  const updated = JSON.parse(JSON.stringify(garden)) as GardenData;
  const reward = ACTION_REWARDS[action];
  
  // Find alive plants to reward
  const alivePlants = updated.plots.filter(p => p.plant && !p.plant.isDead);
  if (alivePlants.length === 0) return updated;

  const today = new Date().toISOString().split('T')[0];
  
  // Distribute to all alive plants (scaled by count)
  const perPlantXP = Math.max(1, Math.floor(reward.xp / alivePlants.length));
  const perPlantHealth = Math.max(1, Math.floor(reward.health / alivePlants.length));

  alivePlants.forEach(plot => {
    if (!plot.plant) return;
    plot.plant.experience += perPlantXP;
    plot.plant.health = Math.min(100, plot.plant.health + perPlantHealth);
    plot.plant.lastCaredDate = today;
    
    // Check stage advancement
    const newStage = getStageForXP(plot.plant.experience);
    if (STAGE_ORDER.indexOf(newStage) > STAGE_ORDER.indexOf(plot.plant.stage)) {
      plot.plant.stage = newStage;
      if (newStage === 'mature') {
        updated.totalPlantsGrown++;
      }
    }
  });

  updated.lifetimeXP += reward.xp;
  updated.lastProcessedDate = today;
  
  // Level up every 200 XP
  updated.gardenLevel = Math.max(1, Math.floor(updated.lifetimeXP / 200) + 1);
  
  // Unlock plots based on level
  const unlockedCount = Math.min(9, 4 + Math.floor((updated.gardenLevel - 1) / 2));
  updated.plots.forEach((plot, i) => {
    if (i < unlockedCount) plot.unlocked = true;
  });

  return updated;
};

export const processGardenDailyDecay = (garden: GardenData): GardenData => {
  const updated = JSON.parse(JSON.stringify(garden)) as GardenData;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastProcessed = new Date(updated.lastProcessedDate);
  lastProcessed.setHours(0, 0, 0, 0);
  
  const daysMissed = Math.floor((today.getTime() - lastProcessed.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysMissed <= 0) return updated;
  
  const decayPerDay = 12;
  
  updated.plots.forEach(plot => {
    if (!plot.plant || plot.plant.isDead) return;
    
    // Check days since this specific plant was last cared for
    const lastCared = new Date(plot.plant.lastCaredDate);
    lastCared.setHours(0, 0, 0, 0);
    const plantDaysMissed = Math.floor((today.getTime() - lastCared.getTime()) / (1000 * 60 * 60 * 24));
    
    if (plantDaysMissed > 0) {
      // Cactus is more resilient
      const decay = plot.plant.type === 'cactus' ? decayPerDay * 0.5 : decayPerDay;
      plot.plant.health = Math.max(0, plot.plant.health - (decay * plantDaysMissed));
      
      if (plot.plant.health <= 0) {
        plot.plant.isDead = true;
        updated.totalPlantsDied++;
      }
    }
  });

  updated.lastProcessedDate = today.toISOString().split('T')[0];
  return updated;
};

export const createPlant = (type: PlantType): GardenPlant => {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    name: PLANT_CATALOG[type].name,
    plantedDate: today,
    lastCaredDate: today,
    health: 80,
    experience: 0,
    stage: 'seed',
    isDead: false,
  };
};
