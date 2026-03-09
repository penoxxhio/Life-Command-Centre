import type { GardenData, GardenActionType, GardenReward } from '@/types';
import { GARDEN_XP_REWARDS, GARDEN_HEALTH_REWARDS } from '@/constants';

export const processGardenAction = (
  garden: GardenData,
  actionType: GardenActionType
): { garden: GardenData; reward: GardenReward | null } => {
  const xp = GARDEN_XP_REWARDS[actionType] || 0;
  const health = GARDEN_HEALTH_REWARDS[actionType] || 0;
  const newGarden = { ...garden, totalXp: garden.totalXp + xp };
  return {
    garden: newGarden,
    reward: { xp, health, message: `+${xp} XP` },
  };
};

export const processGardenDailyDecay = (garden: GardenData): GardenData => {
  return garden;
};
