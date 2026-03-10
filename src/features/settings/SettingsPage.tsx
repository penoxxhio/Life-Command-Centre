import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createInitialAppData } from '@/constants';

export function SettingsPage() {
  const { data, updateProfile, updateFitness, updateNutrition, setData, addToast } = useAppStore();
  const profile = data.profile;
  const fitnessGoals = data.fitness.goals;
  const nutritionGoals = data.nutrition.goals;

  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [payday, setPayday] = useState(String(profile.payday ?? 1));
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(String(nutritionGoals?.dailyCalorieGoal ?? 2000));
  const [dailyProteinGoal, setDailyProteinGoal] = useState(String(nutritionGoals?.dailyProteinGoal ?? 150));
  const [dailyStepTarget, setDailyStepTarget] = useState(String(fitnessGoals?.dailyStepTarget ?? 10000));
  const [showReset, setShowReset] = useState(false);

  const handleSaveProfile = () => {
    updateProfile({ name, currency, payday: parseInt(payday) || 1 });
    addToast('success', 'Profile saved');
  };

  const handleSaveGoals = () => {
    updateNutrition({ ...data.nutrition, goals: { ...data.nutrition.goals, dailyCalorieGoal: parseInt(dailyCalorieGoal) || 2000, dailyProteinGoal: parseInt(dailyProteinGoal) || 150 } });
    updateFitness({ ...data.fitness, goals: { ...data.fitness.goals, dailyStepTarget: parseInt(dailyStepTarget) || 10000 } });
    addToast('success', 'Goals saved');
  };

  const handleReset = () => { setData(createInitialAppData()); setShowReset(false); addToast('info', 'All data has been reset'); };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-display font-bold text-earth-900">Settings</h1>
      <Card className="p-4 space-y-4">
        <h2 className="font-display font-semibold text-earth-800">Profile</h2>
        <div><label className="text-sm text-earth-600 mb-1 block">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="text-sm text-earth-600 mb-1 block">Currency</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm"><option value="$">$ USD</option><option value="\u20ac">EUR</option><option value="\u00a3">GBP</option><option value="AED">AED</option></select></div>
        <div><label className="text-sm text-earth-600 mb-1 block">Payday</label><input type="number" min="1" max="31" value={payday} onChange={(e) => setPayday(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
        <Button onClick={handleSaveProfile}>Save Profile</Button>
      </Card>
      <Card className="p-4 space-y-4">
        <h2 className="font-display font-semibold text-earth-800">Daily Goals</h2>
        <div><label className="text-sm text-earth-600 mb-1 block">Calorie Goal</label><input type="number" value={dailyCalorieGoal} onChange={(e) => setDailyCalorieGoal(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="text-sm text-earth-600 mb-1 block">Protein Goal (g)</label><input type="number" value={dailyProteinGoal} onChange={(e) => setDailyProteinGoal(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="text-sm text-earth-600 mb-1 block">Step Target</label><input type="number" value={dailyStepTarget} onChange={(e) => setDailyStepTarget(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
        <Button onClick={handleSaveGoals}>Save Goals</Button>
      </Card>
      <Card className="p-4 space-y-4 border-red-200">
        <h2 className="font-display font-semibold text-red-700">Danger Zone</h2>
        {!showReset ? (<Button variant="secondary" onClick={() => setShowReset(true)}>Reset All Data</Button>) : (
          <div className="space-y-2"><p className="text-sm text-red-600">This will delete all your data. Are you sure?</p><div className="flex gap-2"><Button variant="secondary" onClick={() => setShowReset(false)}>Cancel</Button><Button onClick={handleReset}>Yes, Reset Everything</Button></div></div>
        )}
      </Card>
    </div>
  );
}
