import { PLANT_CONFIG, GROWTH_STAGES } from '@/constants';
import type { GardenPlant } from '@/types';

interface PlantSpriteProps {
  plant: GardenPlant;
  size?: 'sm' | 'md' | 'lg';
}

export function PlantSprite({ plant, size = 'md' }: PlantSpriteProps) {
  const config = PLANT_CONFIG[plant.type];
  const stageInfo = GROWTH_STAGES[plant.stage];
  const healthColor = plant.health > 60 ? 'text-green-500' : plant.health > 30 ? 'text-yellow-500' : 'text-red-500';

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <div className="flex flex-col items-center">
      <span className={sizeClasses[size]}>
        {stageInfo?.emoji ?? config?.emoji ?? '\ud83c\udf31'}
      </span>
      {/* Health indicator */}
      <div className="w-full mt-1 bg-earth/10 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all ${
            plant.health > 60 ? 'bg-green-400' : plant.health > 30 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${plant.health}%` }}
        />
      </div>
    </div>
  );
}
