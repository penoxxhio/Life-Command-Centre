import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Flame, Timer, TrendingUp, Moon, Footprints, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Workout } from '@/types';

const WORKOUT_TYPES = [
  { key: 'strength', label: 'Strength', emoji: '🏋️' },
  { key: 'cardio', label: 'Cardio', emoji: '🏃' },
  { key: 'flexibility', label: 'Flexibility', emoji: '🧘' },
  { key: 'sports', label: 'Sports', emoji: '⚽' },
  { key: 'hiit', label: 'HIIT', emoji: '🔥' },
  { key: 'swimming', label: 'Swimming', emoji: '🏊' },
];

export const FitnessPage: React.FC = () => {
  const { fitness, setFitness, health } = useAppStore();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState('strength');
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const workouts = fitness.workouts ?? [];
  const todaySteps = fitness.todaySteps ?? 0;
  const stepGoal = health.dailyStepGoal ?? 10000;
  const sleepHours = fitness.lastSleepHours ?? 0;
  const weeklyWorkouts = fitness.weeklyWorkoutCount ?? 0;

  const handleAddWorkout = () => {
    const w: Workout = {
      id: Date.now().toString(),
      type: workoutType,
      name: workoutName.trim() || WORKOUT_TYPES.find(t => t.key === workoutType)?.label || 'Workout',
      duration: parseInt(duration) || 30,
      caloriesBurned: parseInt(caloriesBurned) || 0,
      date: new Date().toISOString(),
    };
    setFitness({
      workouts: [w, ...workouts],
      weeklyWorkoutCount: weeklyWorkouts + 1,
    });
    setWorkoutName('');
    setDuration('');
    setCaloriesBurned('');
    setShowAddWorkout(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setFitness({ workouts: workouts.filter(w => w.id !== deleteId) });
    setDeleteId(null);
  };

  const todayWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const todayCaloriesBurned = todayWorkouts.reduce((s, w) => s + (w.caloriesBurned ?? 0), 0);
  const todayMinutes = todayWorkouts.reduce((s, w) => s + (w.duration ?? 0), 0);

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
      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Footprints className="w-4 h-4 text-terracotta-500" />
            <span className="text-xs text-earth-500">Steps</span>
          </div>
          <p className="text-xl font-display font-bold text-earth-900">{todaySteps.toLocaleString()}</p>
          <ProgressBar value={todaySteps} max={stepGoal} color="terracotta" size="sm" />
          <p className="text-xs text-earth-400 mt-1">{stepGoal.toLocaleString()} goal</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-earth-500">Sleep</span>
          </div>
          <p className="text-xl font-display font-bold text-earth-900">{sleepHours}h</p>
          <ProgressBar value={sleepHours} max={8} color={sleepHours >= 7 ? 'sage' : 'amber'} size="sm" />
          <p className="text-xs text-earth-400 mt-1">8h goal</p>
        </Card>
      </motion.div>

      {/* Today Summary */}
      <motion.div variants={item}>
        <Card className="p-4 bg-gradient-to-r from-terracotta-50 to-cream-50 border-terracotta-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-earth-700">Today's Activity</p>
              <div className="flex gap-4 mt-1">
                <span className="flex items-center gap-1 text-sm text-earth-600">
                  <Timer className="w-3.5 h-3.5" /> {todayMinutes} min
                </span>
                <span className="flex items-center gap-1 text-sm text-earth-600">
                  <Flame className="w-3.5 h-3.5" /> {todayCaloriesBurned} kcal
                </span>
                <span className="flex items-center gap-1 text-sm text-earth-600">
                  <Dumbbell className="w-3.5 h-3.5" /> {todayWorkouts.length}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-terracotta-600">{weeklyWorkouts}</p>
              <p className="text-xs text-earth-500">this week</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Workout List */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-earth-900">Recent Workouts</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowAddWorkout(true)} icon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
        </div>

        {workouts.length === 0 ? (
          <Card className="p-8 text-center">
            <Dumbbell className="w-10 h-10 text-earth-300 mx-auto mb-2" />
            <p className="text-sm text-earth-500">No workouts yet. Start moving!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {workouts.slice(0, 10).map((w) => {
                const typeConfig = WORKOUT_TYPES.find(t => t.key === w.type);
                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <Card className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{typeConfig?.emoji ?? '🏋️'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-earth-900 truncate">{w.name}</p>
                          <p className="text-xs text-earth-400">
                            {new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-earth-700 font-medium">{w.duration}min</p>
                          {w.caloriesBurned > 0 && (
                            <p className="text-xs text-earth-400">{w.caloriesBurned} kcal</p>
                          )}
                        </div>
                        <button onClick={() => setDeleteId(w.id)} className="text-earth-300 hover:text-rose-500 p-1">
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

      {/* Add Workout Modal */}
      <Modal isOpen={showAddWorkout} onClose={() => setShowAddWorkout(false)} title="Log Workout">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {WORKOUT_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setWorkoutType(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-garden text-sm transition-all ${
                    workoutType === t.key ? 'bg-terracotta-500 text-white' : 'bg-cream-100 text-earth-600'
                  }`}
                >
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>
          <Input label="Name (optional)" placeholder="e.g. Chest & Back" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
          <Input label="Duration (min)" type="number" placeholder="30" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Input label="Calories Burned" type="number" placeholder="0" value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} />
          <Button variant="warm" fullWidth onClick={handleAddWorkout}>Log Workout</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Workout"
        message="Remove this workout from your history?"
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
};
