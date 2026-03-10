import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Droplets, Coffee, Sun, Moon as MoonIcon, Cookie, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassModal, StatRing } from '../../components/ui';
import type { Meal, MealType } from '../../types';

const MEAL_TYPES: { value: MealType; label: string; icon: React.ReactNode }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: <Coffee size={14} /> },
  { value: 'lunch', label: 'Lunch', icon: <Sun size={14} /> },
  { value: 'dinner', label: 'Dinner', icon: <MoonIcon size={14} /> },
  { value: 'snack', label: 'Snack', icon: <Cookie size={14} /> },
];

export function NutritionPage() {
  const data = useAppStore((s) => s.data);
  const addMeal = useAppStore((s) => s.addMeal);
  const deleteMeal = useAppStore((s) => s.deleteMeal);
  const logWater = useAppStore((s) => s.logWater);
  const { nutrition } = data;

  const [showAdd, setShowAdd] = useState(false);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mealName, setMealName] = useState('');
  const [mealCals, setMealCals] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFat, setMealFat] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = useMemo(() => nutrition.meals.filter((m) => m.date === today), [nutrition.meals, today]);
  const todayWater = nutrition.waterLog.find((w) => w.date === today)?.glasses || 0;

  const totals = useMemo(() => ({
    calories: todayMeals.reduce((s, m) => s + m.calories, 0),
    protein: todayMeals.reduce((s, m) => s + m.protein, 0),
    carbs: todayMeals.reduce((s, m) => s + m.carbs, 0),
    fat: todayMeals.reduce((s, m) => s + m.fat, 0),
  }), [todayMeals]);

  const handleAdd = () => {
    if (!mealName.trim()) return;
    const meal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      name: mealName.trim(),
      calories: parseInt(mealCals) || 0,
      protein: parseInt(mealProtein) || 0,
      carbs: parseInt(mealCarbs) || 0,
      fat: parseInt(mealFat) || 0,
      date: today,
      time: new Date().toTimeString().slice(0, 5),
    };
    addMeal(meal);
    setMealName('');
    setMealCals('');
    setMealProtein('');
    setMealCarbs('');
    setMealFat('');
    setShowAdd(false);
  };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemV = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5" variants={containerV} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemV} className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold text-void-100">Nutrition</h1>
        <GlassButton variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Meal
        </GlassButton>
      </motion.div>

      {/* Macro Rings */}
      <motion.div variants={itemV}>
        <GlassCard padding="md">
          <div className="grid grid-cols-4 gap-2">
            <StatRing
              value={totals.calories}
              max={nutrition.goals.dailyCalories}
              color="amber"
              size={68}
              label="Calories"
              strokeWidth={5}
            />
            <StatRing
              value={totals.protein}
              max={nutrition.goals.dailyProtein}
              color="neon"
              size={68}
              label="Protein"
              strokeWidth={5}
            />
            <StatRing
              value={totals.carbs}
              max={nutrition.goals.dailyCarbs}
              color="purple"
              size={68}
              label="Carbs"
              strokeWidth={5}
            />
            <StatRing
              value={totals.fat}
              max={nutrition.goals.dailyFat}
              color="red"
              size={68}
              label="Fat"
              strokeWidth={5}
            />
          </div>
          {/* Numeric row */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            <div className="text-center">
              <p className="font-mono text-xs text-void-100">{totals.calories}</p>
              <p className="text-[8px] text-void-500">/ {nutrition.goals.dailyCalories}</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xs text-void-100">{totals.protein}g</p>
              <p className="text-[8px] text-void-500">/ {nutrition.goals.dailyProtein}g</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xs text-void-100">{totals.carbs}g</p>
              <p className="text-[8px] text-void-500">/ {nutrition.goals.dailyCarbs}g</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xs text-void-100">{totals.fat}g</p>
              <p className="text-[8px] text-void-500">/ {nutrition.goals.dailyFat}g</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Water Tracker */}
      <motion.div variants={itemV}>
        <GlassCard padding="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplets size={20} className="text-mp" />
              <div>
                <p className="text-sm font-semibold text-void-100">
                  {todayWater} / {nutrition.goals.waterGlasses} glasses
                </p>
                <p className="text-[10px] text-void-400">Stay hydrated!</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <GlassButton variant="neon" size="sm" onClick={() => logWater(1)}>+1</GlassButton>
              <GlassButton variant="ghost" size="sm" onClick={() => logWater(2)}>+2</GlassButton>
            </div>
          </div>
          {/* Water dots */}
          <div className="flex gap-1 mt-2">
            {Array.from({ length: nutrition.goals.waterGlasses }).map((_, i) => (
              <motion.div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < todayWater ? 'bg-mp' : 'bg-white/[0.06]'
                }`}
                initial={i < todayWater ? { scale: 0 } : undefined}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Add Buttons */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Quick Add</p>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((mt) => (
            <GlassButton
              key={mt.value}
              variant="secondary"
              size="sm"
              icon={mt.icon}
              onClick={() => { setMealType(mt.value); setShowAdd(true); }}
              className="flex-col !gap-1 !py-3"
            >
              {mt.label}
            </GlassButton>
          ))}
        </div>
      </motion.div>

      {/* Today's Meals */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Today's Meals</p>
        {todayMeals.length === 0 ? (
          <GlassCard padding="lg">
            <div className="text-center space-y-2">
              <Coffee size={32} className="text-void-600 mx-auto" />
              <p className="text-void-400 text-sm">No meals logged today.</p>
              <p className="text-void-500 text-xs">Feed your creature by logging what you eat!</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {todayMeals.map((meal) => {
              const mealInfo = MEAL_TYPES.find((mt) => mt.value === meal.type);
              return (
                <GlassCard key={meal.id} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-ember-500/10 text-ember-400">
                        {mealInfo?.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-void-100">{meal.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-void-400">
                          <span>{meal.calories} kcal</span>
                          <span>&middot;</span>
                          <span>P: {meal.protein}g</span>
                          <span>&middot;</span>
                          <span>C: {meal.carbs}g</span>
                          <span>&middot;</span>
                          <span>F: {meal.fat}g</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteMeal(meal.id)} className="p-1.5 text-void-500 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Add Meal Modal */}
      <GlassModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Log Meal">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-1.5">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => setMealType(mt.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-glass border text-xs transition-all ${
                  mealType === mt.value
                    ? 'bg-neon-500/10 border-neon-500/30 text-neon-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-void-400 hover:bg-white/[0.04]'
                }`}
              >
                {mt.icon}
                <span>{mt.label}</span>
              </button>
            ))}
          </div>
          <GlassInput label="Food Name" placeholder="e.g. Grilled Chicken" value={mealName} onChange={(e) => setMealName(e.target.value)} autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Calories" type="number" placeholder="0" value={mealCals} onChange={(e) => setMealCals(e.target.value)} suffix="kcal" />
            <GlassInput label="Protein" type="number" placeholder="0" value={mealProtein} onChange={(e) => setMealProtein(e.target.value)} suffix="g" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Carbs" type="number" placeholder="0" value={mealCarbs} onChange={(e) => setMealCarbs(e.target.value)} suffix="g" />
            <GlassInput label="Fat" type="number" placeholder="0" value={mealFat} onChange={(e) => setMealFat(e.target.value)} suffix="g" />
          </div>
          <GlassButton variant="primary" fullWidth onClick={handleAdd} disabled={!mealName.trim()}>
            Log Meal
          </GlassButton>
        </div>
      </GlassModal>
    </motion.div>
  );
}
