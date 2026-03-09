import React from 'react';
import { motion } from 'framer-motion';
import type { GardenPlant } from '@/types';
import { PLANT_CONFIG, GROWTH_STAGES } from '@/constants';

interface PlantSpriteProps {
  plant: GardenPlant;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 48, md: 72, lg: 96 };

export const PlantSprite: React.FC<PlantSpriteProps> = ({ plant, onClick, size = 'md' }) => {
  const config = PLANT_CONFIG[plant.type];
  const stage = GROWTH_STAGES[plant.growthStage ?? 0];
  const health = plant.health ?? 100;
  const px = sizeMap[size];

  // Sway animation — healthy plants sway more
  const swayAmount = health > 70 ? 3 : health > 30 ? 1.5 : 0.5;

  // Health-based opacity
  const healthOpacity = health > 50 ? 1 : 0.5 + (health / 100) * 0.5;

  return (
    <motion.div
      onClick={onClick}
      className="cursor-pointer relative flex flex-col items-center"
      whileTap={{ scale: 0.9 }}
    >
      {/* Sparkle for high-health plants */}
      {health >= 90 && (
        <motion.div
          className="absolute -top-1 -right-1 text-xs"
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
      )}

      {/* Plant emoji with sway */}
      <motion.div
        animate={{ rotate: [-swayAmount, swayAmount, -swayAmount] }}
        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          fontSize: px * 0.6,
          opacity: healthOpacity,
          transformOrigin: 'bottom center',
        }}
      >
        {config?.stages?.[plant.growthStage ?? 0] ?? config?.emoji ?? '🌱'}
      </motion.div>

      {/* Name & stage label */}
      <p className="text-xs text-earth-600 font-medium mt-1 text-center truncate" style={{ maxWidth: px }}>
        {plant.name || config?.name || 'Plant'}
      </p>
      <p className="text-[10px] text-earth-400">{stage?.label ?? 'Seed'}</p>

      {/* Health bar */}
      <div className="w-full mt-1 h-1 bg-cream-200 rounded-full overflow-hidden" style={{ maxWidth: px * 0.8 }}>
        <motion.div
          className={`h-full rounded-full ${
            health > 70 ? 'bg-sage-500' : health > 30 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${health}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};
