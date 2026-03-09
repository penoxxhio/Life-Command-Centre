import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, Wallet, Heart, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
}

const WelcomeStep: React.FC<StepProps> = ({ onNext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex flex-col items-center text-center px-6 py-12"
  >
    <motion.div
      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
      className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center mb-8"
    >
      <Flower2 className="w-12 h-12 text-sage-600" />
    </motion.div>
    <h1 className="text-3xl font-display font-bold text-earth-900 mb-3">
      Plant Your Garden
    </h1>
    <p className="text-earth-600 mb-2 max-w-sm">
      Welcome to your Life Command Centre. Think of it as a garden where
      every healthy habit, smart financial move, and bit of progress
      helps your plants grow.
    </p>
    <p className="text-earth-500 text-sm mb-10 max-w-sm">
      Let's set things up in about 2 minutes.
    </p>
    <Button variant="primary" size="lg" onClick={onNext} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
      Let's Begin
    </Button>
  </motion.div>
);

const FinanceStep: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { data, updateMoney } = useAppStore();
  const [salary, setSalary] = useState(data.money.monthlyIncome?.toString() || '');
  const [currency, setCurrency] = useState(data.money.currency || 'AED');

  const handleNext = () => {
    updateMoney({ monthlyIncome: parseFloat(salary) || 0, currency });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="px-6 py-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-earth-900">Your Finances</h2>
          <p className="text-sm text-earth-500">Set up your money garden</p>
        </div>
      </div>
      <Card className="p-5 space-y-4 mb-8">
        <Input label="Monthly Income" type="number" placeholder="e.g. 15000" value={salary} onChange={(e) => setSalary(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">Currency</label>
          <div className="flex gap-2">
            {['AED', 'USD', 'EUR', 'GBP', 'SAR'].map((c) => (
              <button key={c} onClick={() => setCurrency(c)} className={`px-3 py-1.5 rounded-garden text-sm font-medium transition-all ${currency === c ? 'bg-sage-500 text-white shadow-garden' : 'bg-cream-100 text-earth-600 hover:bg-cream-200'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        <Button variant="primary" fullWidth onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">Continue</Button>
      </div>
    </motion.div>
  );
};

const HealthStep: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { data, updateFitness, updateNutrition } = useAppStore();
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');
  const [steps, setSteps] = useState('10000');

  const handleNext = () => {
    updateNutrition({ dailyCalorieGoal: parseInt(calories) || 2000, dailyProteinGoal: parseInt(protein) || 150 });
    updateFitness({ dailyStepGoal: parseInt(steps) || 10000 });
    onNext();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-earth-900">Health Goals</h2>
          <p className="text-sm text-earth-500">Nourish your garden with good habits</p>
        </div>
      </div>
      <Card className="p-5 space-y-4 mb-8">
        <Input label="Daily Calorie Target" type="number" placeholder="2000" value={calories} onChange={(e) => setCalories(e.target.value)} />
        <Input label="Daily Protein Target (g)" type="number" placeholder="150" value={protein} onChange={(e) => setProtein(e.target.value)} />
        <Input label="Daily Step Goal" type="number" placeholder="10000" value={steps} onChange={(e) => setSteps(e.target.value)} />
      </Card>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        <Button variant="primary" fullWidth onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">Continue</Button>
      </div>
    </motion.div>
  );
};

const GardenIntroStep: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center px-6 py-12">
    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center mb-8">
      <Sparkles className="w-12 h-12 text-amber-500" />
    </motion.div>
    <h2 className="text-2xl font-display font-bold text-earth-900 mb-3">Your Garden Awaits</h2>
    <p className="text-earth-600 mb-2 max-w-sm">Every workout, healthy meal, and smart money move earns sunlight for your garden. Watch your plants grow as you build better habits.</p>
    <p className="text-earth-500 text-sm mb-10 max-w-sm">You'll start with a small seed. Nurture it daily and watch it bloom.</p>
    <div className="flex gap-3">
      <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
      <Button variant="warm" size="lg" onClick={onFinish} icon={<Check className="w-5 h-5" />} iconPosition="right">Start Growing</Button>
    </div>
  </motion.div>
);

const ProgressDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex justify-center gap-2 py-4">
    {Array.from({ length: total }).map((_, i) => (
      <motion.div key={i} animate={{ width: i === current ? 24 : 8, backgroundColor: i === current ? 'var(--color-sage-500)' : i < current ? 'var(--color-sage-300)' : 'var(--color-cream-300)' }} className="h-2 rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
    ))}
  </div>
);

export const SetupWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const { updateProfile } = useAppStore();

  const handleFinish = () => {
    updateProfile({ setupComplete: true });
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 flex flex-col">
      <ProgressDots current={step} total={4} />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 0 && <WelcomeStep key="welcome" onNext={next} />}
            {step === 1 && <FinanceStep key="finance" onNext={next} onBack={back} />}
            {step === 2 && <HealthStep key="health" onNext={next} onBack={back} />}
            {step === 3 && <GardenIntroStep key="garden" onFinish={handleFinish} onBack={back} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
