import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Wallet, Heart, Sparkles, Trash2, Download, Upload } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassModal } from '../../components/ui';
import { CreatureSprite } from '../creature/CreatureSprite';
import { SPECIES_CONFIG, STAGE_DESCRIPTIONS } from '../creature/creatureConfig';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20ac)' },
  { value: 'GBP', label: 'GBP (\u00a3)' },
  { value: 'AED', label: 'AED (\u062f.\u0625)' },
  { value: 'SAR', label: 'SAR (\ufdfc)' },
  { value: 'INR', label: 'INR (\u20b9)' },
  { value: 'JPY', label: 'JPY (\u00a5)' },
];

export function SettingsPage() {
  const data = useAppStore((s) => s.data);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updateMoneySettings = useAppStore((s) => s.updateMoneySettings);
  const updateFitnessGoals = useAppStore((s) => s.updateFitnessGoals);
  const updateNutritionGoals = useAppStore((s) => s.updateNutritionGoals);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const addToast = useAppStore((s) => s.addToast);
  const { profile, creature, money, fitness, nutrition } = data;

  const [showReset, setShowReset] = useState(false);
  const [localName, setLocalName] = useState(profile.name);
  const [localCurrency, setLocalCurrency] = useState(profile.currency);
  const [localIncome, setLocalIncome] = useState(money.monthlyIncome.toString());
  const [localCals, setLocalCals] = useState(nutrition.goals.dailyCalories.toString());
  const [localProtein, setLocalProtein] = useState(nutrition.goals.dailyProtein.toString());
  const [localCarbs, setLocalCarbs] = useState(nutrition.goals.dailyCarbs.toString());
  const [localFat, setLocalFat] = useState(nutrition.goals.dailyFat.toString());
  const [localWorkouts, setLocalWorkouts] = useState(fitness.goals.weeklyWorkouts.toString());
  const [localSleep, setLocalSleep] = useState(fitness.goals.dailySleepHours.toString());

  const handleSaveProfile = () => {
    updateProfile({ name: localName.trim(), currency: localCurrency });
    addToast({ message: 'Profile updated', type: 'success' });
  };

  const handleSaveMoney = () => {
    updateMoneySettings({ monthlyIncome: parseFloat(localIncome) || 0 });
    addToast({ message: 'Money settings updated', type: 'success' });
  };

  const handleSaveHealth = () => {
    updateNutritionGoals({
      dailyCalories: parseInt(localCals) || 2200,
      dailyProtein: parseInt(localProtein) || 150,
      dailyCarbs: parseInt(localCarbs) || 250,
      dailyFat: parseInt(localFat) || 70,
    });
    updateFitnessGoals({
      weeklyWorkouts: parseInt(localWorkouts) || 4,
      dailySleepHours: parseInt(localSleep) || 8,
    });
    addToast({ message: 'Health goals updated', type: 'success' });
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lcc-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ message: 'Data exported!', type: 'success' });
  };

  const handleReset = () => {
    resetAllData();
    setShowReset(false);
    addToast({ message: 'All data reset', type: 'info' });
  };

  const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemV = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
  const speciesInfo = SPECIES_CONFIG[creature.species];

  return (
    <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5" variants={containerV} initial="hidden" animate="show">
      <motion.div variants={itemV}>
        <h1 className="font-display text-2xl font-bold text-void-100">Settings</h1>
      </motion.div>

      {/* Creature Info */}
      <motion.div variants={itemV}>
        <GlassCard padding="md">
          <div className="flex items-center gap-4">
            <CreatureSprite creature={creature} size="sm" showMood={false} showName={false} interactive={false} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-ember-400" />
                <p className="font-display font-semibold text-void-100">{creature.name}</p>
              </div>
              <p className="text-xs mt-0.5" style={{ color: speciesInfo.color }}>
                {creature.stage.toUpperCase()} {speciesInfo.name}
              </p>
              <p className="text-[10px] text-void-400 mt-1">
                {STAGE_DESCRIPTIONS[creature.stage]}
              </p>
              <p className="text-[10px] text-void-500 mt-0.5 font-mono">
                {creature.xp} XP &middot; {creature.totalDaysAlive} days alive
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Profile */}
      <motion.div variants={itemV}>
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-neon-400" />
          <p className="section-title">Profile</p>
        </div>
        <GlassCard padding="md">
          <div className="space-y-4">
            <GlassInput label="Name" value={localName} onChange={(e) => setLocalName(e.target.value)} />
            <GlassSelect label="Currency" value={localCurrency} onChange={(e) => setLocalCurrency(e.target.value)} options={CURRENCIES} />
            <GlassButton variant="primary" size="sm" onClick={handleSaveProfile}>Save Profile</GlassButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Money */}
      <motion.div variants={itemV}>
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={16} className="text-emerald-400" />
          <p className="section-title">Money</p>
        </div>
        <GlassCard padding="md">
          <div className="space-y-4">
            <GlassInput label="Monthly Income" type="number" value={localIncome} onChange={(e) => setLocalIncome(e.target.value)} suffix={localCurrency} />
            <GlassButton variant="primary" size="sm" onClick={handleSaveMoney}>Save</GlassButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Health */}
      <motion.div variants={itemV}>
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-hp" />
          <p className="section-title">Health & Fitness</p>
        </div>
        <GlassCard padding="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <GlassInput label="Daily Calories" type="number" value={localCals} onChange={(e) => setLocalCals(e.target.value)} suffix="kcal" />
              <GlassInput label="Daily Protein" type="number" value={localProtein} onChange={(e) => setLocalProtein(e.target.value)} suffix="g" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <GlassInput label="Daily Carbs" type="number" value={localCarbs} onChange={(e) => setLocalCarbs(e.target.value)} suffix="g" />
              <GlassInput label="Daily Fat" type="number" value={localFat} onChange={(e) => setLocalFat(e.target.value)} suffix="g" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <GlassInput label="Weekly Workouts" type="number" value={localWorkouts} onChange={(e) => setLocalWorkouts(e.target.value)} />
              <GlassInput label="Sleep Goal (hrs)" type="number" value={localSleep} onChange={(e) => setLocalSleep(e.target.value)} />
            </div>
            <GlassButton variant="primary" size="sm" onClick={handleSaveHealth}>Save Goals</GlassButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Data</p>
        <div className="flex gap-2">
          <GlassButton variant="secondary" icon={<Download size={14} />} onClick={handleExport}>
            Export
          </GlassButton>
          <GlassButton variant="danger" icon={<Trash2 size={14} />} onClick={() => setShowReset(true)}>
            Reset All
          </GlassButton>
        </div>
      </motion.div>

      {/* Reset Confirmation */}
      <GlassModal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset All Data?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-void-300">
            This will permanently delete all your data including {creature.name} the {speciesInfo.name}.
            This cannot be undone.
          </p>
          <div className="flex gap-2">
            <GlassButton variant="ghost" onClick={() => setShowReset(false)} fullWidth>Cancel</GlassButton>
            <GlassButton variant="danger" onClick={handleReset} fullWidth>Reset Everything</GlassButton>
          </div>
        </div>
      </GlassModal>
    </motion.div>
  );
}
