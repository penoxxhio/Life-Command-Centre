import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Meal } from '@/types';
import { getTodayCalories, getTodayProtein } from '@/utils/computedHelpers';

export function NutritionPage() {
  const { data, updateNutrition } = useAppStore();
  const nutrition = data.nutrition;
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<Meal['type']>('lunch');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');

  const todayCalories = getTodayCalories(nutrition.meals);
  const dailyCalorieGoal = nutrition.goals.dailyCalorieGoal;
  const todayProtein = getTodayProtein(nutrition.meals);
  const dailyProteinGoal = nutrition.goals.dailyProteinGoal;

  const handleAddMeal = () => {
    if (!mealName || !mealCalories) return;
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: mealName,
      type: mealType,
      calories: parseInt(mealCalories),
      protein: mealProtein ? parseInt(mealProtein) : undefined,
      date: new Date().toISOString(),
    };
    updateNutrition({
      ...nutrition,
      meals: [...nutrition.meals, newMeal],
    });
    setMealName('');
    setMealType('lunch');
    setMealCalories('');
    setMealProtein('');
    setShowAddMeal(false);
  };

  return (
    <div className="space-y-6">
      {/* Daily Progress */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-garden p-4 shadow-garden">
          <p className="text-xs text-earth/60 mb-1">Calories</p>
          <p className="text-2xl font-bold text-terracotta">{todayCalories}</p>
          <p className="text-xs text-earth/40">of {dailyCalorieGoal} goal</p>
          <ProgressBar value={todayCalories} max={dailyCalorieGoal} variant="terracotta" />
        </div>
        <div className="bg-white rounded-garden p-4 shadow-garden">
          <p className="text-xs text-earth/60 mb-1">Protein</p>
          <p className="text-2xl font-bold text-sage">{todayProtein}g</p>
          <p className="text-xs text-earth/40">of {dailyProteinGoal}g goal</p>
          <ProgressBar value={todayProtein} max={dailyProteinGoal} variant="sage" />
        </div>
      </div>

      {/* Add Meal */}
      <div className="bg-white rounded-garden p-4 shadow-garden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-earth">Meals</h3>
          <button
            onClick={() => setShowAddMeal(!showAddMeal)}
            className="text-sm text-sage hover:text-sage/80"
          >
            {showAddMeal ? 'Cancel' : '+ Add Meal'}
          </button>
        </div>

        {showAddMeal && (
          <div className="space-y-3 mb-4 p-3 bg-cream rounded-garden">
            <input
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Meal name"
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            />
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as Meal['type'])}
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <input
              type="number"
              value={mealCalories}
              onChange={(e) => setMealCalories(e.target.value)}
              placeholder="Calories"
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            />
            <input
              type="number"
              value={mealProtein}
              onChange={(e) => setMealProtein(e.target.value)}
              placeholder="Protein (g, optional)"
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            />
            <button
              onClick={handleAddMeal}
              className="w-full py-2 bg-earth text-cream rounded-garden text-sm font-medium"
            >
              Log Meal
            </button>
          </div>
        )}

        {/* Today's Meals */}
        <div className="space-y-2">
          {nutrition.meals
            .filter((m) => {
              const today = new Date().toDateString();
              return new Date(m.date).toDateString() === today;
            })
            .map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-2 bg-cream/50 rounded-garden">
                <div>
                  <p className="text-sm font-medium text-earth">{meal.name}</p>
                  <p className="text-xs text-earth/60">{meal.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-terracotta">{meal.calories} cal</p>
                  {meal.protein && <p className="text-xs text-sage">{meal.protein}g protein</p>}
                </div>
              </div>
            ))}
          {nutrition.meals.filter((m) => new Date(m.date).toDateString() === new Date().toDateString()).length === 0 && (
            <p className="text-sm text-earth/40 text-center py-4">No meals logged today</p>
          )}
        </div>
      </div>
    </div>
  );
}
