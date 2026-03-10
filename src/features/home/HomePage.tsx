import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Flower2, Dumbbell, UtensilsCrossed, Flame,
  Footprints, Heart, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PLANT_CONFIG } from '@/constants';
import {
  getMonthlySpent, getTodayCalories, getTodayProtein, getTodaySteps,
} from '@/utils/computedHelpers';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, color, bgColor, onClick }) => (
  <motion.div whileTap={{ scale: 0.97 }} onClick={onClick} className="cursor-pointer">
    <Card className="p-4 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-earth-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-earth-900">{value}</p>
          {subtitle && <p className="text-xs text-earth-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const GardenPreview: React.FC = () => {
  const { data } = useAppStore();
  const garden = data.garden;
  const activePlants = garden.plots.filter((p) => p.plant).slice(0, 4);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flower2 className="w-5 h-5 text-sage-600" />
          <h3 className="font-display font-semibold text-earth-900">Garden</h3>
        </div>
        <span className="text-xs text-earth-500">Level {garden.level}</span>
      </div>
      {activePlants.length === 0 ? (
        <p className="text-sm text-earth-400 text-center py-4">Plant your first seed!</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {activePlants.map((plot) => {
            const plant = plot.plant!;
            const config = PLANT_CONFIG[plant.type];
            return (
              <div key={plot.id} className="text-center">
                <div className="text-2xl mb-1">{config?.emoji ?? '\uD83C\uDF31'}</div>
                <p className="text-xs text-earth-600 truncate">{config?.name ?? plant.type}</p>
                <div className="mt-1">
                  <ProgressBar value={plant.health} max={100} variant="sage" size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export function HomePage() {
  const navigate = useNavigate();
  const { data } = useAppStore();
  const { money, fitness, nutrition, profile } = data;

  const monthlySpent = useMemo(() => getMonthlySpent(money.transactions, money.expenses), [money.transactions, money.expenses]);
  const todayCalories = useMemo(() => getTodayCalories(nutrition.meals), [nutrition.meals]);
  const todayProtein = useMemo(() => getTodayProtein(nutrition.meals), [nutrition.meals]);
  const todaySteps = useMemo(() => getTodaySteps(fitness.workouts), [fitness.workouts]);

  const calorieGoal = nutrition.goals?.dailyCalorieGoal ?? 2000;
  const proteinGoal = nutrition.goals?.dailyProteinGoal ?? 150;
  const stepGoal = fitness.goals?.dailyStepTarget ?? 10000;
  const currency = profile.currency ?? '$';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-display font-bold text-earth-900">
          {greeting}, {profile.name || 'there'}
        </h1>
        <p className="text-earth-500 text-sm mt-1">Here's your life at a glance</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Wallet className="w-5 h-5" />} label="Spent this month" value={`${currency}${monthlySpent.toLocaleString()}`} color="text-amber-600" bgColor="bg-amber-50" onClick={() => navigate('/money')} />
        <StatCard icon={<Flame className="w-5 h-5" />} label="Calories today" value={`${todayCalories}`} subtitle={`of ${calorieGoal} goal`} color="text-orange-600" bgColor="bg-orange-50" onClick={() => navigate('/nutrition')} />
        <StatCard icon={<Footprints className="w-5 h-5" />} label="Steps today" value={todaySteps.toLocaleString()} subtitle={`of ${stepGoal.toLocaleString()} goal`} color="text-blue-600" bgColor="bg-blue-50" onClick={() => navigate('/fitness')} />
        <StatCard icon={<Heart className="w-5 h-5" />} label="Protein today" value={`${todayProtein}g`} subtitle={`of ${proteinGoal}g goal`} color="text-rose-600" bgColor="bg-rose-50" onClick={() => navigate('/nutrition')} />
      </div>
      <Card className="p-4 space-y-3">
        <h3 className="font-display font-semibold text-earth-900 text-sm">Today's Progress</h3>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-earth-600">Calories</span><span className="text-earth-500">{todayCalories} / {calorieGoal}</span></div>
          <ProgressBar value={todayCalories} max={calorieGoal} variant="amber" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-earth-600">Protein</span><span className="text-earth-500">{todayProtein}g / {proteinGoal}g</span></div>
          <ProgressBar value={todayProtein} max={proteinGoal} variant="rose" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-earth-600">Steps</span><span className="text-earth-500">{todaySteps.toLocaleString()} / {stepGoal.toLocaleString()}</span></div>
          <ProgressBar value={todaySteps} max={stepGoal} variant="sage" />
        </div>
      </Card>
      <GardenPreview />
      <div className="space-y-2">
        {[
          { icon: <Wallet className="w-5 h-5" />, label: 'Money', path: '/money', color: 'text-amber-600' },
          { icon: <Dumbbell className="w-5 h-5" />, label: 'Fitness', path: '/fitness', color: 'text-blue-600' },
          { icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Nutrition', path: '/nutrition', color: 'text-orange-600' },
          { icon: <Flower2 className="w-5 h-5" />, label: 'Garden', path: '/garden', color: 'text-sage-600' },
        ].map((item) => (
          <motion.div key={item.path} whileTap={{ scale: 0.98 }} onClick={() => navigate(item.path)}>
            <Card className="p-3 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={item.color}>{item.icon}</div>
                <span className="font-medium text-earth-800">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-earth-400" />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
