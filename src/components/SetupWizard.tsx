import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Step = 'welcome' | 'profile' | 'finance' | 'health' | 'done';

export function SetupWizard() {
  const { data, updateProfile, updateMoney, updateFitness, updateNutrition } = useAppStore();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(data.profile.name);
  const [currency, setCurrency] = useState(data.profile.currency);
  const [totalIncome, setTotalIncome] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [proteinGoal, setProteinGoal] = useState('150');
  const [stepTarget, setStepTarget] = useState('10000');

  const handleFinish = () => {
    updateProfile({ name, currency, setupComplete: true });
    if (totalIncome) {
      updateMoney({ ...data.money, budgetConfig: { ...data.money.budgetConfig, totalIncome: parseFloat(totalIncome) || 0 } });
    }
    updateNutrition({ ...data.nutrition, goals: { ...data.nutrition.goals, dailyCalorieGoal: parseInt(calorieGoal) || 2000, dailyProteinGoal: parseInt(proteinGoal) || 150 } });
    updateFitness({ ...data.fitness, goals: { ...data.fitness.goals, dailyStepTarget: parseInt(stepTarget) || 10000 } });
    setStep('done');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sage-50 to-earth-50">
      <Card className="w-full max-w-md p-6">
        {step === 'welcome' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">{'\uD83C\uDF31'}</div>
            <h1 className="text-2xl font-display font-bold text-earth-900">Welcome to Life Command Centre</h1>
            <p className="text-earth-600 text-sm">Your personal dashboard for money, fitness, nutrition, and your virtual garden.</p>
            <Button onClick={() => setStep('profile')} className="w-full">Get Started</Button>
          </div>
        )}
        {step === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-earth-900">About You</h2>
            <div><label className="text-sm text-earth-600 mb-1 block">Your Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-sm text-earth-600 mb-1 block">Currency</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm"><option value="$">$ USD</option><option value="\u20ac">EUR</option><option value="\u00a3">GBP</option><option value="AED">AED</option></select></div>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep('welcome')}>Back</Button><Button onClick={() => setStep('finance')} className="flex-1">Next</Button></div>
          </div>
        )}
        {step === 'finance' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-earth-900">Finances</h2>
            <div><label className="text-sm text-earth-600 mb-1 block">Monthly Income</label><input type="number" value={totalIncome} onChange={(e) => setTotalIncome(e.target.value)} placeholder="e.g. 5000" className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep('profile')}>Back</Button><Button onClick={() => setStep('health')} className="flex-1">Next</Button></div>
          </div>
        )}
        {step === 'health' && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-earth-900">Health Goals</h2>
            <div><label className="text-sm text-earth-600 mb-1 block">Daily Calorie Goal</label><input type="number" value={calorieGoal} onChange={(e) => setCalorieGoal(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-sm text-earth-600 mb-1 block">Daily Protein Goal (g)</label><input type="number" value={proteinGoal} onChange={(e) => setProteinGoal(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-sm text-earth-600 mb-1 block">Daily Step Target</label><input type="number" value={stepTarget} onChange={(e) => setStepTarget(e.target.value)} className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep('finance')}>Back</Button><Button onClick={handleFinish} className="flex-1">Finish Setup</Button></div>
          </div>
        )}
        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">{'\uD83C\uDF89'}</div>
            <h2 className="text-xl font-display font-bold text-earth-900">You're all set!</h2>
            <p className="text-earth-600 text-sm">Start tracking your finances, fitness, nutrition, and grow your garden!</p>
          </div>
        )}
      </Card>
    </div>
  );
}
