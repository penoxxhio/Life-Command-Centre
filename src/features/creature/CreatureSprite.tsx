import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import type { CreatureData, CreatureAnimation } from '../../types';
import { SPECIES_CONFIG, MOOD_EXPRESSIONS } from './creatureConfig';
import { getEvolutionProgress } from './creatureService';

interface CreatureSpriteProps {
  creature: CreatureData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMood?: boolean;
  showName?: boolean;
  interactive?: boolean;
  onTap?: () => void;
}

const sizeMultiplier = { sm: 0.6, md: 1, lg: 1.4, xl: 1.8 };

const animationVariants: Record<CreatureAnimation, object> = {
  idle: {
    y: [0, -4, 0, -2, 0],
    rotate: [0, -1, 0, 1, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  'happy-bounce': {
    y: [0, -20, 0, -12, 0],
    scale: [1, 1.1, 1, 1.05, 1],
    transition: { duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] },
  },
  flex: {
    scale: [1, 1.15, 1.1, 1.15, 1],
    rotate: [0, -3, 3, -2, 0],
    transition: { duration: 0.8, ease: 'easeInOut' },
  },
  eat: {
    scale: [1, 1.08, 0.95, 1.05, 1],
    y: [0, -5, 2, -2, 0],
    transition: { duration: 0.7, ease: 'easeInOut' },
  },
  nod: {
    y: [0, 3, -2, 1, 0],
    rotate: [0, 2, -1, 0.5, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  sleep: {
    y: [0, 2, 0],
    scale: [1, 0.98, 1],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  play: {
    y: [0, -8, 0, -6, 0],
    rotate: [0, 5, -5, 3, 0],
    x: [0, 5, -5, 3, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  'sad-idle': {
    y: [0, 1, 0],
    scale: [1, 0.97, 1],
    rotate: [0, -2, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  evolve: {
    scale: [1, 0.8, 1.3, 1],
    rotate: [0, 0, 360, 360],
    transition: { duration: 2, ease: 'easeInOut' },
  },
  celebrate: {
    y: [0, -25, 0, -15, 0],
    scale: [1, 1.2, 1, 1.1, 1],
    rotate: [0, -10, 10, -5, 0],
    transition: { duration: 1, ease: [0.68, -0.55, 0.265, 1.55] },
  },
};

export function CreatureSprite({
  creature,
  size = 'md',
  showMood = true,
  showName = true,
  interactive = true,
  onTap,
}: CreatureSpriteProps) {
  const config = SPECIES_CONFIG[creature.species];
  const moodInfo = MOOD_EXPRESSIONS[creature.mood];
  const mult = sizeMultiplier[size];
  const baseSize = config.stageSizes[creature.stage];
  const displaySize = baseSize * mult;
  const evoProgress = getEvolutionProgress(creature);

  const glowClass = useMemo(() => {
    return `creature-glow-${creature.stage}`;
  }, [creature.stage]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Creature body */}
      <motion.div
        className={`relative flex items-center justify-center cursor-pointer select-none ${glowClass}`}
        style={{ width: displaySize + 40, height: displaySize + 40 }}
        animate={animationVariants[creature.animation] as any}
        whileHover={interactive ? { scale: 1.05 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        onClick={onTap}
      >
        {/* Background glow circle */}
        <div
          className="absolute rounded-full opacity-30 blur-xl"
          style={{
            width: displaySize * 1.5,
            height: displaySize * 1.5,
            background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Creature emoji/sprite */}
        <span
          className="relative z-10 select-none"
          style={{ fontSize: displaySize }}
          role="img"
          aria-label={`${config.name} - ${creature.stage}`}
        >
          {config.stageEmojis[creature.stage]}
        </span>

        {/* Mood indicator */}
        {showMood && creature.animation !== 'sleep' && (
          <AnimatePresence>
            <motion.span
              key={creature.mood}
              className="absolute -top-1 -right-1 text-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {moodInfo.face}
            </motion.span>
          </AnimatePresence>
        )}

        {/* Sleep ZZZ */}
        {creature.animation === 'sleep' && (
          <motion.span
            className="absolute -top-2 right-0 text-xs text-void-400 font-mono"
            animate={{ opacity: [0, 1, 0], y: [0, -8, -16] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            zzz
          </motion.span>
        )}
      </motion.div>

      {/* Name & stage */}
      {showName && (
        <div className="text-center">
          <p className="font-display font-semibold text-void-100 text-sm">
            {creature.name}
          </p>
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: config.color }}>
            {creature.stage} {config.name}
          </p>
        </div>
      )}

      {/* XP Progress mini bar */}
      {creature.stage !== 'legendary' && (
        <div className="w-24 h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${evoProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}
