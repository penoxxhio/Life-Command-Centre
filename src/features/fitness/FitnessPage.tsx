import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Dumbbell, Clock, Flame, Trash2, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassModal, GlassProgress, StatRing } from '../../components/ui';
import type { Workout } from '../../types';

const WORKOUT_TYPES = [
  { value: 'Strength', label: 'Strength' },
  { value: 'Cardio', label: 'Cardio' },
  { value: 'HIIT', label: 'HIIT' },
  { value: 'Yoga', label: 'Yoga' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Walking', label: 'Walking' },
  { value: 'Other', label: 'Other' },
];

const INTENSITIES = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'intense', label: 'Intense' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function FitnessPage() {
  const data = useAppStore((s) => s.data);
  const addWorkout = useAppStore((s) => s.addWorkout);
  const deleteWorkout = useAppStore((s) => s.deleteWorkout);
  const { fitness } = data;

  const [showAdd, setShowAdd] = useState(false);
  const [wkType, setWkType] = useState('Strength');
  const [wkTitle, setWkTitle] = useState('');
  const [wkDuration, setWkDuration] = useState('45');
  const [wkIntensity, setWkIntensity] = useState('moderate');
  const [wkNotes, setWkNotes] = useState('');

  // Weekly data
  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const weekWorkouts = useMemo(() =>
    fitness.workouts.filter((w) => weekDates.includes(w.date)),
    [fitness.workouts, weekDates]
  );

  const weekMinutes = weekWorkouts.reduce((s, w) => s + w.duration, 0);
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (!wkTitle.trim()) return;
    const w: Workout = {
      id: Date.now().toString(),
      type: wkType,
      title: wkTitle.trim(),
      duration: parseInt(wkDuration) || 0,
      intensity: wkIntensity as Workout['intensity'],
      notes: wkNotes.trim(),
      date: today,
    };
    addWorkout(w);
    setWkTitle('');
    setWkNotes('');
    setShowAdd(false);
  };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemV = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5" variants={containerV} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemV} className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold text-void-100">Fitness</h1>
        <GlassButton variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Workout
        </GlassButton>
      </motion.div>

      {/* Weekly Overview */}
      <motion.div variants={itemV}>
        <GlassCard padding="md">
          <div className="flex justify-around mb-4">
            <StatRing
              value={weekWorkouts.length}
              max={fitness.goals.weeklyWorkouts}
              color="neon"
              size={64}
              label="Sessions"
              strokeWidth={5}
            />
            <StatRing
              value={weekMinutes}
              max={fitness.goals.weeklyCardioMinutes}
              color="purple"
              size={64}
              label="Minutes"
              strokeWidth={5}
            />
          </div>
          {/* Week calendar strip */}
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, i) => {
              const hasWorkout = weekWorkouts.some((w) => w.date === date);
              const isToday = date === today;
              return (
                <div key={date} className="flex flex-col items-center gap-1">
                  <span className={`text-[9px] font-medium uppercase ${isToday ? 'text-neon-400' : 'text-void-500'}`}>
                    {DAY_LABELS[i]}
                  </span>
                  <motion.div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono
                      ${hasWorkout ? 'bg-neon-500/20 text-neon-400 border border-neon-500/30' :
                        isToday ? 'bg-white/[0.06] text-void-200 border border-white/[0.1]' :
                        'bg-white/[0.02] text-void-500 border border-white/[0.04]'}
                    `}
                    whileHover={{ scale: 1.1 }}
                  >
                    {new Date(date + 'T12:00').getDate()}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      {/* Streak */}
      <motion.div variants={itemV}>
        <GlassCard variant="amber" padding="sm" glow>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame size={20} className="text-streak" />
              <div>
                <p className="text-sm font-semibold text-void-100">{fitness.currentStreak} Day Streak</p>
                <p className="text-[10px] text-void-400">Best: {fitness.longestStreak} days</p>
              </div>
            </div>
            <GlassProgress value={fitness.currentStreak} max={Math.max(fitness.longestStreak, 7)} color="amber" size="sm" className="w-24" />
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Recent Workouts</p>
        {fitness.workouts.length === 0 ? (
          <GlassCard padding="lg">
            <div className="text-center space-y-2">
              <Dumbbell size={32} className="text-void-600 mx-auto" />
              <p className="text-void-400 text-sm">No workouts logged yet.</p>
              <p className="text-void-500 text-xs">Log your first workout and watch your creature grow stronger!</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {fitness.workouts.slice(0, 10).map((w) => (
              <GlassCard key={w.id} padding="sm" hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      w.intensity === 'intense' ? 'bg-hp/10' :
                      w.intensity === 'moderate' ? 'bg-neon-500/10' : 'bg-emerald-500/10'
                    }`}>
                      <Dumbbell size={14} className={`${
                        w.intensity === 'intense' ? 'text-hp' :
                        w.intensity === 'moderate' ? 'text-neon-400' : 'text-emerald-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-void-100">{w.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-void-400">
                        <span>{w.type}</span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-0.5"><Clock size={9} />{w.duration}m</span>
                        <span>&middot;</span>
                        <span>{w.date}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteWorkout(w.id)} className="p-1.5 text-void-500 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Workout Modal */}
      <GlassModal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Log Workout">
        <div className="space-y-4">
          <GlassInput label="Title" placeholder="e.g. Push Day" value={wkTitle} onChange={(e) => setWkTitle(e.target.value)} autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <GlassSelect label="Type" value={wkType} onChange={(e) => setWkType(e.target.value)} options={WORKOUT_TYPES} />
            <GlassSelect label="Intensity" value={wkIntensity} onChange={(e) => setWkIntensity(e.target.value)} options={INTENSITIES} />
          </div>
          <GlassInput label="Duration" type="number" value={wkDuration} onChange={(e) => setWkDuration(e.target.value)} suffix="min" />
          <GlassInput label="Notes" placeholder="Optional notes" value={wkNotes} onChange={(e) => setWkNotes(e.target.value)} />
          <GlassButton variant="primary" fullWidth onClick={handleAdd} disabled={!wkTitle.trim()}>
            Log Workout
          </GlassButton>
        </div>
      </GlassModal>
    </motion.div>
  );
}
