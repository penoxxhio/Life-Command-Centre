import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Zap, Brain, Shield, TrendingUp, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard, GlassProgress, StatRing } from '../../components/ui';
import { CreatureSprite } from './CreatureSprite';
import { getEvolutionProgress, getStageIndex } from './creatureService';
import { SPECIES_CONFIG, STAGE_DESCRIPTIONS, STAGE_ORDER, MOOD_EXPRESSIONS, EVOLUTION_THRESHOLDS } from './creatureConfig';

export function CreaturePage() {
  const data = useAppStore((s) => s.data);
  const { creature, xpHistory } = data;
  const config = SPECIES_CONFIG[creature.species];
  const moodInfo = MOOD_EXPRESSIONS[creature.mood];
  const evoProgress = getEvolutionProgress(creature);
  const stageIdx = getStageIndex(creature.stage);

  // Recent XP events
  const recentXP = useMemo(() => xpHistory.slice(-10).reverse(), [xpHistory]);

  // Time since last interactions
  const timeSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemV = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5" variants={containerV} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemV}>
        <h1 className="font-display text-2xl font-bold text-void-100">Creature</h1>
      </motion.div>

      {/* Creature Hero */}
      <motion.div variants={itemV}>
        <GlassCard variant="default" padding="lg" className="flex flex-col items-center">
          <CreatureSprite creature={creature} size="xl" />
          <p className="text-void-400 text-sm mt-2 text-center italic">
            &ldquo;{moodInfo.message}&rdquo;
          </p>
        </GlassCard>
      </motion.div>

      {/* Vital Stats */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Vitals</p>
        <GlassCard padding="md">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <StatRing value={creature.stats.hunger} color="amber" size={48} strokeWidth={4} />
              <div>
                <p className="text-sm font-medium text-void-100">Hunger</p>
                <p className="text-[10px] text-void-400">Fed {timeSince(creature.lastFed)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatRing value={creature.stats.energy} color="neon" size={48} strokeWidth={4} />
              <div>
                <p className="text-sm font-medium text-void-100">Energy</p>
                <p className="text-[10px] text-void-400">Trained {timeSince(creature.lastTrained)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatRing value={creature.stats.happiness} color="purple" size={48} strokeWidth={4} />
              <div>
                <p className="text-sm font-medium text-void-100">Happiness</p>
                <p className="text-[10px] text-void-400">Mood: {creature.mood}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatRing value={creature.stats.discipline} color="green" size={48} strokeWidth={4} />
              <div>
                <p className="text-sm font-medium text-void-100">Discipline</p>
                <p className="text-[10px] text-void-400">Track expenses!</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Evolution Path */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Evolution Path</p>
        <GlassCard padding="md">
          {/* Stage indicators */}
          <div className="flex items-center justify-between mb-4">
            {STAGE_ORDER.map((stage, i) => {
              const isActive = i <= stageIdx;
              const isCurrent = stage === creature.stage;
              return (
                <div key={stage} className="flex flex-col items-center gap-1">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent ? 'border-neon-500 bg-neon-500/20 shadow-neon' :
                      isActive ? 'border-neon-500/40 bg-neon-500/10' :
                      'border-white/[0.08] bg-white/[0.02]'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.05, 1] } : undefined}
                    transition={isCurrent ? { duration: 2, repeat: Infinity } : undefined}
                  >
                    <span className="text-lg">
                      {isActive ? config.stageEmojis[stage] : '?'}
                    </span>
                  </motion.div>
                  <span className={`text-[8px] uppercase tracking-wider font-medium ${
                    isCurrent ? 'text-neon-400' : isActive ? 'text-void-300' : 'text-void-600'
                  }`}>
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress to next stage */}
          {creature.stage !== 'legendary' ? (
            <>
              <GlassProgress
                value={evoProgress}
                color="neon"
                size="md"
                showValue
                label={`Progress to ${STAGE_ORDER[stageIdx + 1]?.toUpperCase()}`}
              />
              <p className="text-[10px] text-void-400 mt-2 text-center">
                {creature.xp} / {EVOLUTION_THRESHOLDS[STAGE_ORDER[stageIdx + 1]]} XP
              </p>
            </>
          ) : (
            <div className="text-center py-2">
              <Sparkles size={24} className="text-ember-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-ember-400">Maximum Evolution Reached!</p>
            </div>
          )}

          <p className="text-xs text-void-400 mt-3 text-center">
            {STAGE_DESCRIPTIONS[creature.stage]}
          </p>
        </GlassCard>
      </motion.div>

      {/* XP Activity Log */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Recent Activity</p>
        {recentXP.length === 0 ? (
          <GlassCard padding="md">
            <p className="text-center text-void-400 text-sm">
              No activity yet. Log meals, workouts, or expenses to earn XP!
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-1.5">
            {recentXP.map((event, i) => (
              <GlassCard key={i} padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-xp" />
                    <p className="text-xs text-void-200">{event.description}</p>
                  </div>
                  <span className="text-xs font-mono text-ember-400">+{event.xp} XP</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>

      {/* Stats summary */}
      <motion.div variants={itemV}>
        <GlassCard variant="heavy" padding="sm">
          <div className="flex justify-around text-center">
            <div>
              <p className="font-mono text-lg font-bold text-void-100">{creature.xp}</p>
              <p className="text-[9px] text-void-400 uppercase">Total XP</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-void-100">{creature.totalDaysAlive}</p>
              <p className="text-[9px] text-void-400 uppercase">Days Alive</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-void-100">{creature.longestStreak}</p>
              <p className="text-[9px] text-void-400 uppercase">Best Streak</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-void-100">{creature.evolvedAt.length}</p>
              <p className="text-[9px] text-void-400 uppercase">Evolutions</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
