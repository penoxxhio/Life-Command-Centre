import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Flower2,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Flame,
  Moon,
  Footprints,
  Heart,
  Sprout,
  ChevronRight,
  Sun,
  Droplets,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PLANT_CONFIG } from '@/constants';

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
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 ${bgColor} rounded-full opacity-30`} />
    </Card>
  </motion.div>
);

const GardenPreview: React.FC = () => {
  const { data } = useAppStore();
  const garden = data.garden;
  const navigate = useNavigate();
  const healthyPlants = garden.plants?.filter((p: any) => (p.health ?? 100) > 50).length ?? 0;
  const totalPlants = garden.plants?.length ?? 0;

  return (
    <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigate('/garden')} className="cursor-pointer">
      <Card className="p-5 bg-gradient-to-br from-sage-50 to-cream-50 border-sage-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-sage-600" />
            <h3 className="font-display font-bold text-earth-900">Your Garden</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-earth-400" />
        </div>
        {totalPlants === 0 ? (
          <div className="text-center py-6">
            <Sprout className="w-10 h-10 text-sage-400 mx-auto mb-2" />
            <p className="text-sm text-earth-500">Plant your first seed to get started</p>
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-3">
              {garden.plants?.slice(0, 5).map((plant: any) => {
                const config = PLANT_CONFIG[plant.type];
                return (
                  <motion.div key={plant.id} animate={{ y: [0, -3, 0] }} transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: 'easeInOut' }} className="text-2xl" title={config?.name || plant.type}>
                    {config?.emoji || '\u{1F331}'}
                  </motion.div>
                );
              })}
              {totalPlants > 5 && <span className="text-sm text-earth-400 self-center">+{totalPlants - 5}</span>}
            </div>
            <div className="flex items-center gap-4 text-xs text-earth-500">
              <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-500" />{garden.sunlight ?? 0} sunlight</span>
              <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-sky-500" />{garden.water ?? 0} water</span>
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" />{healthyPlants}/{totalPlants} healthy</span>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
};

const DailyProgress: React.FC = () => {
  const { data } = useAppStore();
  const nutrition = data.nutrition;
  const fitness = data.fitness;
  const caloriesEaten = nutrition.todayCalories ?? 0;
  const calorieGoal = nutrition.dailyCalorieGoal ?? 2000;
  const proteinEaten = nutrition.todayProtein ?? 0;
  const proteinGoal = nutrition.dailyProteinGoal ?? 150;
  const steps = fitness.todaySteps ?? 0;
  const stepGoal = fitness.dailyStepGoal ?? 10000;
  const items = [
    { label: 'Calories', current: caloriesEaten, goal: calorieGoal, unit: 'kcal', color: 'amber' as const },
    { label: 'Protein', current: proteinEaten, goal: proteinGoal, unit: 'g', color: 'sage' as const },
    { label: 'Steps', current: steps, goal: stepGoal, unit: '', color: 'terracotta' as const },
  ];

  return (
    <Card className="p-5">
      <h3 className="font-display font-bold text-earth-900 mb-4">Today's Progress</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-earth-600 font-medium">{item.label}</span>
              <span className="text-earth-500">{item.current.toLocaleString()}{item.unit} / {item.goal.toLocaleString()}{item.unit}</span>
            </div>
            <ProgressBar value={item.current} max={item.goal} variant={item.color} size="md" />
          </div>
        ))}
      </div>
    </Card>
  );
};

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const actions = [
    { label: 'Log Meal', icon: <UtensilsCrossed className="w-5 h-5" />, path: '/nutrition', color: 'bg-amber-100 text-amber-600' },
    { label: 'Workout', icon: <Dumbbell className="w-5 h-5" />, path: '/fitness', color: 'bg-terracotta-100 text-terracotta-600' },
    { label: 'Expense', icon: <Wallet className="w-5 h-5" />, path: '/money', color: 'bg-sage-100 text-sage-600' },
    { label: 'Garden', icon: <Flower2 className="w-5 h-5" />, path: '/garden', color: 'bg-rose-100 text-rose-500' },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => (
        <motion.button key={action.label} whileTap={{ scale: 0.93 }} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-2 py-3">
          <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center`}>{action.icon}</div>
          <span className="text-xs font-medium text-earth-600">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

const StreakBanner: React.FC = () => {
  const { data } = useAppStore();
  const currentStreak = data.garden.streak ?? 0;
  if (currentStreak < 1) return null;
  return (
    <Card className="p-4 bg-gradient-to-r from-amber-50 to-terracotta-50 border-amber-200">
      <div className="flex items-center gap-3">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Flame className="w-8 h-8 text-terracotta-500" />
        </motion.div>
        <div>
          <p className="font-display font-bold text-earth-900">{currentStreak} day streak!</p>
          <p className="text-xs text-earth-500">Keep it going to help your garden thrive</p>
        </div>
      </div>
    </Card>
  );
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) return <Sun className="w-5 h-5 text-amber-500" />;
  return <Moon className="w-5 h-5 text-indigo-400" />;
}

export const HomePage: React.FC = () => {
  const { data } = useAppStore();
  const money = data.money;
  const navigate = useNavigate();
  const balance = useMemo(() => {
    const accounts = money.accounts ?? [];
    return accounts.reduce((sum: number, a: any) => sum + (a.balance ?? 0), 0);
  }, [money.accounts]);
  const currency = money.currency ?? 'AED';
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">
      <motion.div variants={item} className="flex items-center gap-2">
        {getGreetingIcon()}
        <h1 className="text-xl font-display font-bold text-earth-900">{getGreeting()}</h1>
      </motion.div>
      <motion.div variants={item}><StreakBanner /></motion.div>
      <motion.div variants={item}><QuickActions /></motion.div>
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <StatCard icon={<Wallet className="w-5 h-5" />} label="Balance" value={`${currency} ${balance.toLocaleString()}`} color="text-sage-600" bgColor="bg-sage-100" onClick={() => navigate('/money')} />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="This Month" value={`${currency} ${(money.monthlySpent ?? 0).toLocaleString()}`} subtitle="spent so far" color="text-amber-600" bgColor="bg-amber-100" onClick={() => navigate('/money')} />
        <StatCard icon={<Footprints className="w-5 h-5" />} label="Steps" value={(0).toLocaleString()} subtitle="today" color="text-terracotta-600" bgColor="bg-terracotta-100" onClick={() => navigate('/fitness')} />
        <StatCard icon={<Flame className="w-5 h-5" />} label="Calories" value={(0).toLocaleString()} subtitle="consumed" color="text-rose-600" bgColor="bg-rose-100" onClick={() => navigate('/nutrition')} />
      </motion.div>
      <motion.div variants={item}><GardenPreview /></motion.div>
      <motion.div variants={item}><DailyProgress /></motion.div>
    </motion.div>
  );
};