import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Plus, Apple, Beef, Wheat, Droplets, Trash2, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Meal } from '@/types';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
  { key: 'snack', label: 'Snack', emoji: '🍎' },
];

const QUICK_FOODS = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Rice (1 cup)', calories: 206, protein: 4.3, carbs: 45, fat: 0.4 },
  { name: 'Eggs (2)', calories: 156, protein: 12, carbs: 1.1, fat: 10.6 },
  { name: 'Protein Shake', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
];

export const NutritionPage: React.FC = () => {
  const { health, setHealth } = useAppStore();
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mealType, setMealType] = useState('lunch');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const meals = health.meals ?? [];
  const calorieGoal = health.dailyCalorieGoal ?? 2000;
  const proteinGoal = health.dailyProteinGoal ?? 150;

  // Today's totals
  const todayMeals = useMemo(() => {
    const now = new Date();
    return meals.filter(m => new Date(m.date).toDateString() === now.toDateString());
  }, [meals]);

  const totals = useMemo(() => {
    return todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories ?? 0),
        protein: acc.protein + (m.protein ?? 0),
        carbs: acc.carbs + (m.carbs ?? 0),
        fat: acc.fat + (m.fat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const handleAddMeal = () => {
    const meal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      name: foodName.trim() || 'Meal',
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      date: new Date().toISOString(),
    };
    setHealth({
      meals: [meal, ...meals],
      todayCalories: totals.calories + meal.calories,
      todayProtein: totals.protein + meal.protein,
    });
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setShowAddMeal(false);
  };

  const handleQuickAdd = (food: typeof QUICK_FOODS[0]) => {
    setFoodName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updated = meals.filter(m => m.id !== deleteId);
    setHealth({ meals: updated });
    setDeleteId(null);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">
      {/* Macro Rings */}
      <motion.div variants={item}>
        <Card className="p-5">
          <h3 className="font-display font-bold text-earth-900 mb-4">Today's Nutrition</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1 text-earth-600">
                  <Apple className="w-3.5 h-3.5 text-amber-500" /> Calories
                </span>
                <span className="text-earth-500">{totals.calories} / {calorieGoal}</span>
              </div>
              <ProgressBar value={totals.calories} max={calorieGoal} color="amber" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1 text-earth-600">
                  <Beef className="w-3.5 h-3.5 text-terracotta-500" /> Protein
                </span>
                <span className="text-earth-500">{totals.protein}g / {proteinGoal}g</span>
              </div>
              <ProgressBar value={totals.protein} max={proteinGoal} color="terracotta" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1 text-earth-600">
                  <Wheat className="w-3.5 h-3.5 text-sage-500" /> Carbs
                </span>
                <span className="text-earth-500">{totals.carbs}g</span>
              </div>
              <ProgressBar value={totals.carbs} max={250} color="sage" size="sm" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1 text-earth-600">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" /> Fat
                </span>
                <span className="text-earth-500">{totals.fat}g</span>
              </div>
              <ProgressBar value={totals.fat} max={65} color="amber" size="sm" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today's Meals */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-earth-900">Meals Today</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowAddMeal(true)} icon={<Plus className="w-4 h-4" />}>
            Log
          </Button>
        </div>

        {todayMeals.length === 0 ? (
          <Card className="p-8 text-center">
            <UtensilsCrossed className="w-10 h-10 text-earth-300 mx-auto mb-2" />
            <p className="text-sm text-earth-500">No meals logged today</p>
            <Button variant="warm" size="sm" className="mt-3" onClick={() => setShowAddMeal(true)}>
              Log Your First Meal
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {todayMeals.map((meal) => {
                const typeConfig = MEAL_TYPES.find(t => t.key === meal.type);
                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <Card className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{typeConfig?.emoji ?? '🍽️'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-earth-900 truncate">{meal.name}</p>
                          <p className="text-xs text-earth-400">
                            {meal.protein}g protein · {meal.carbs}g carbs · {meal.fat}g fat
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-earth-900">{meal.calories}</p>
                          <p className="text-xs text-earth-400">kcal</p>
                        </div>
                        <button onClick={() => setDeleteId(meal.id)} className="text-earth-300 hover:text-rose-500 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Protein Tip */}
      {totals.protein < proteinGoal * 0.5 && todayMeals.length > 0 && (
        <motion.div variants={item}>
          <Card className="p-4 bg-gradient-to-r from-sage-50 to-cream-50 border-sage-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-sage-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-earth-700">Protein Tip</p>
                <p className="text-xs text-earth-500 mt-0.5">
                  You need {Math.round(proteinGoal - totals.protein)}g more protein today.
                  Try chicken breast, eggs, or a protein shake.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add Meal Modal */}
      <Modal isOpen={showAddMeal} onClose={() => setShowAddMeal(false)} title="Log Meal">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Meal Type</label>
            <div className="flex gap-2">
              {MEAL_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setMealType(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-garden text-sm transition-all ${
                    mealType === t.key ? 'bg-sage-500 text-white' : 'bg-cream-100 text-earth-600'
                  }`}
                >
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Chips */}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Quick Add</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FOODS.map((food) => (
                <button
                  key={food.name}
                  onClick={() => handleQuickAdd(food)}
                  className="px-2.5 py-1 rounded-garden text-xs bg-cream-100 text-earth-600 hover:bg-cream-200 transition-all"
                >
                  {food.name}
                </button>
              ))}
            </div>
          </div>

          <Input label="Food" placeholder="What did you eat?" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Calories" type="number" placeholder="0" value={calories} onChange={(e) => setCalories(e.target.value)} />
            <Input label="Protein (g)" type="number" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} />
            <Input label="Carbs (g)" type="number" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            <Input label="Fat (g)" type="number" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
          <Button variant="warm" fullWidth onClick={handleAddMeal}>Log Meal</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Meal"
        message="Remove this meal entry?"
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
};
