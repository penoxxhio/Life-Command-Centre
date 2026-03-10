import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Workout } from '@/types';
import { getTodaySteps, getWeeklyWorkoutCount, getLastSleepHours } from '@/utils/computedHelpers';

export function FitnessPage() {
  const { data, updateFitness } = useAppStore();
  const fitness = data.fitness;
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutCalories, setWorkoutCalories] = useState('');

  const goals = fitness.goals;
  const todaySteps = getTodaySteps(fitness.workouts);
  const weeklyWorkouts = getWeeklyWorkoutCount(fitness.workouts);
  const lastSleep = getLastSleepHours(fitness.sleepLog ?? []);

  const handleAddWorkout = () => {
    if (!workoutName || !workoutDuration) return;
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: workoutName,
      type: workoutType,
      duration: parseInt(workoutDuration),
      caloriesBurned: workoutCalories ? parseInt(workoutCalories) : undefined,
      date: new Date().toISOString(),
    };
    updateFitness({
      ...fitness,
      workouts: [...fitness.workouts, newWorkout],
    });
    setWorkoutName('');
    setWorkoutType('strength');
    setWorkoutDuration('');
    setWorkoutCalories('');
    setShowAddWorkout(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-garden p-3 shadow-garden text-center">
          <p className="text-2xl font-bold text-sage">{todaySteps.toLocaleString()}</p>
          <p className="text-xs text-earth/60">Steps Today</p>
          <ProgressBar value={todaySteps} max={goals.dailyStepGoal ?? goals.dailyStepTarget ?? 10000} variant="sage" />
        </div>
        <div className="bg-white rounded-garden p-3 shadow-garden text-center">
          <p className="text-2xl font-bold text-terracotta">{weeklyWorkouts}</p>
          <p className="text-xs text-earth/60">Workouts</p>
          <ProgressBar value={weeklyWorkouts} max={goals.weeklyWorkoutGoal ?? goals.weeklySessionTarget ?? 4} variant="terracotta" />
        </div>
        <div className="bg-white rounded-garden p-3 shadow-garden text-center">
          <p className="text-2xl font-bold text-leaf">{lastSleep}h</p>
          <p className="text-xs text-earth/60">Last Sleep</p>
          <ProgressBar value={lastSleep} max={goals.dailySleepTarget ?? 8} variant="leaf" />
        </div>
      </div>

      {/* Add Workout */}
      <div className="bg-white rounded-garden p-4 shadow-garden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-earth">Workouts</h3>
          <button
            onClick={() => setShowAddWorkout(!showAddWorkout)}
            className="text-sm text-sage hover:text-sage/80"
          >
            {showAddWorkout ? 'Cancel' : '+ Add Workout'}
          </button>
        </div>

        {showAddWorkout && (
          <div className="space-y-3 mb-4 p-3 bg-cream rounded-garden">
            <input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Workout name"
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            />
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              value={workoutDuration}
              onChange={(e) => setWorkoutDuration(e.target.value)}
              placeholder="Duration (minutes)"
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            />
            <input
              type="number"
              value={workoutCalories}
              onChange={(e) => setWorkoutCalories(e.target.value)}
              placeholder="Calories burned (optional)"
              className="w-full p-2 rounded-garden border border-earth/20 text-sm"
            />
            <button
              onClick={handleAddWorkout}
              className="w-full py-2 bg-earth text-cream rounded-garden text-sm font-medium"
            >
              Log Workout
            </button>
          </div>
        )}

        {/* Recent Workouts */}
        <div className="space-y-2">
          {fitness.workouts
            .slice(-5)
            .reverse()
            .map((w) => (
              <div key={w.id} className="flex items-center justify-between p-2 bg-cream/50 rounded-garden">
                <div>
                  <p className="text-sm font-medium text-earth">{w.name}</p>
                  <p className="text-xs text-earth/60">{w.type} • {w.duration}min</p>
                </div>
                {w.caloriesBurned && (
                  <span className="text-xs text-terracotta font-medium">{w.caloriesBurned} cal</span>
                )}
              </div>
            ))}
          {fitness.workouts.length === 0 && (
            <p className="text-sm text-earth/40 text-center py-4">No workouts logged yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
