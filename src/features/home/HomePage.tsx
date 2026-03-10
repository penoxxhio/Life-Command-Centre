import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Target, TrendingUp, Droplets, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard, StatRing, GlassProgress } from '../../components/ui';
import { CreatureSprite } from '../creature/CreatureSprite';
import { getEvolutionProgress, getStageIndex } from '../creature/creatureService';
import { STAGE_ORDER, MOOD_EXPRESSIONS } from '../creature/creatureConfig';

export function HomePage() {
  const data = useAppStore((s) => s.data);
  const { profile, creature, money, fitness, nutrition, streaks } = data;

  const today = new Date().toISOString().split('T')[0];

  // Today's nutrition totals
  const todayMeals = useMemo(
    () => nutrition.meals.filter((m) => m.date === today),
    [nutrition.meals, today]
  );
  const todayCals = todayMeals.reduce((s, m) => s + m.calories, 0);
  const todayProtein = todayMeals.reduce((s, m) => s + m.protein, 0);

  // This week's workouts
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }, []);
  const weekWorkouts = fitness.workouts.filter((w) => w.date >= weekStart).length;

  // Net worth
  const netWorth = money.accounts.reduce((s, a) => {
    return s + (a.type === 'credit' || a.type === 'loan' ? -a.balance : a.balance);
  }, 0);

  // Total debt
  const totalDebt = money.debts.reduce((s, d) => s + d.balance, 0);

  // Monthly spending
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const monthSpending = money.transactions
    .filter((t) => t.type === 'expense' && t.date >= monthStart)
    .reduce((s, t) => s + t.amount, 0);

  // Water today
  const todayWater = nutrition.waterLog.find((w) => w.date === today)?.glasses || 0;

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const evoProgress = getEvolutionProgress(creature);
  const stageIdx = getStageIndex(creature.stage);
  const moodInfo = MOOD_EXPRESSIONS[creature.mood];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-2xl font-bold text-void-100">
          {greeting}, {profile.name}
        </h1>
        <p className="text-void-400 text-sm mt-0.5">{moodInfo.message}</p>
      </motion.div>

      {/* Creature hero section */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="default" padding="lg" className="flex flex-col items-center">
          <CreatureSprite creature={creature} size="xl" />
          <div className="mt-4 w-full space-y-3">
            {/* Evolution progress */}
            {creature.stage !== 'legendary' && (
              <GlassProgress
                value={evoProgress}
                color="neon"
                size="md"
                label={`Stage ${stageIdx + 1}/5 — ${creature.stage.toUpperCase()}`}
                showValue
              />
            )}
            {creature.stage === 'legendary' && (
              <p className="text-center text-xs font-semibold text-ember-400 uppercase tracking-wider">
                Legendary Status Achieved
              </p>
            )}
            {/* Creature stat rings */}
            <div className="flex justify-around pt-2">
              <StatRing value={creature.stats.hunger} color="amber" size={52} label="Hunger" strokeWidth={4} />
              <StatRing value={creature.stats.energy} color="neon" size={52} label="Energy" strokeWidth={4} />
              <StatRing value={creature.stats.happiness} color="purple" size={52} label="Happy" strokeWidth={4} />
              <StatRing value={creature.stats.discipline} color="green" size={52} label="Discip" strokeWidth={4} />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <GlassCard hover padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-streak/10">
              <Flame size={18} className="text-streak" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-void-100">{streaks.current}</p>
              <p className="text-[10px] text-void-400 uppercase tracking-wider">Day Streak</p>
            </div>
          </div>
        </GlassCard>

        {/* XP */}
        <GlassCard hover padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-xp/10">
              <Zap size={18} className="text-xp" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-void-100">{creature.xp}</p>
              <p className="text-[10px] text-void-400 uppercase tracking-wider">Total XP</p>
            </div>
          </div>
        </GlassCard>

        {/* Workouts this week */}
        <GlassCard hover padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neon-500/10">
              <Target size={18} className="text-neon-400" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-void-100">
                {weekWorkouts}/{fitness.goals.weeklyWorkouts}
              </p>
              <p className="text-[10px] text-void-400 uppercase tracking-wider">Workouts</p>
            </div>
          </div>
        </GlassCard>

        {/* Net Worth */}
        <GlassCard hover padding="sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-void-100">
                {netWorth.toLocaleString()}
              </p>
              <p className="text-[10px] text-void-400 uppercase tracking-wider">Net Worth</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Today's nutrition summary */}
      <motion.div variants={itemVariants}>
        <GlassCard padding="md">
          <p className="section-title mb-3">Today's Fuel</p>
          <div className="grid grid-cols-3 gap-4">
            <StatRing
              value={todayCals}
              max={nutrition.goals.dailyCalories}
              color="amber"
              size={64}
              label="Calories"
              strokeWidth={5}
            />
            <StatRing
              value={todayProtein}
              max={nutrition.goals.dailyProtein}
              color="neon"
              size={64}
              label="Protein"
              strokeWidth={5}
            />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Droplets size={14} className="text-mp" />
                <span className="font-mono font-semibold text-void-100 text-sm">
                  {todayWater}/{nutrition.goals.waterGlasses}
                </span>
              </div>
              <span className="text-[10px] text-void-400 uppercase tracking-wider">Water</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Monthly spend */}
      <motion.div variants={itemVariants}>
        <GlassCard padding="md">
          <div className="flex justify-between items-center">
            <div>
              <p className="section-title">This Month</p>
              <p className="text-2xl font-bold font-mono text-void-100 mt-1">
                {profile.currency} {monthSpending.toLocaleString()}
              </p>
            </div>
            {totalDebt > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-void-400 uppercase tracking-wider">Debt</p>
                <p className="text-sm font-mono text-hp">
                  {profile.currency} {totalDebt.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          {money.monthlyIncome > 0 && (
            <GlassProgress
              value={monthSpending}
              max={money.monthlyIncome}
              color={monthSpending > money.monthlyIncome * 0.9 ? 'red' : 'neon'}
              size="sm"
              className="mt-3"
            />
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
