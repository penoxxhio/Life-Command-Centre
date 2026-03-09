import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sun, Droplets, Sprout, Trash2 } from 'lucide-react';
import type { GardenPlant } from '@/types';
import { PLANT_CONFIG, GROWTH_STAGES } from '@/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PlantSprite } from './PlantSprite';

interface PlantDetailProps {
  plant: GardenPlant;
  onWater: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export const PlantDetail: React.FC<PlantDetailProps> = ({ plant, onWater, onRemove, onClose }) => {
  const config = PLANT_CONFIG[plant.type];
  const stage = GROWTH_STAGES[plant.growthStage ?? 0];
  const health = plant.health ?? 100;
  const xp = plant.xp ?? 0;
  const nextLevelXp = (plant.growthStage ?? 0 + 1) * 100;

  return (
    <div className="space-y-4">
      {/* Plant Display */}
      <div className="flex justify-center py-4">
        <PlantSprite plant={plant} size="lg" />
      </div>

      {/* Stats */}
      <Card className="p-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1.5 text-earth-600">
              <Heart className="w-4 h-4 text-rose-500" /> Health
            </span>
            <span className="text-earth-500">{health}%</span>
          </div>
          <ProgressBar value={health} max={100} color={health > 50 ? 'sage' : 'terracotta'} size="sm" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1.5 text-earth-600">
              <Sprout className="w-4 h-4 text-sage-500" /> Growth
            </span>
            <span className="text-earth-500">{stage?.label ?? 'Seed'}</span>
          </div>
          <ProgressBar value={xp} max={nextLevelXp || 100} color="amber" size="sm" />
          <p className="text-xs text-earth-400 mt-0.5">{xp} / {nextLevelXp} XP to next stage</p>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-earth-600">Sunlight: {plant.sunlight ?? 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span className="text-earth-600">Water: {plant.water ?? 0}</span>
          </div>
        </div>
        {config?.careNotes && (
          <p className="text-xs text-earth-400 mt-3 italic">{config.careNotes}</p>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onWater}
          icon={<Droplets className="w-4 h-4" />}
        >
          Water Plant
        </Button>
      </div>
      <Button
        variant="ghost"
        fullWidth
        onClick={onRemove}
        className="text-rose-500 hover:bg-rose-50"
        icon={<Trash2 className="w-4 h-4" />}
      >
        Remove Plant
      </Button>
    </div>
  );
};
