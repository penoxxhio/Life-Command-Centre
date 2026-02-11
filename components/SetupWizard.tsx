import React, { useState } from 'react';
import { AppData, UserProfile, BankAccount, FitnessGoals } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Check, ArrowRight, Wallet, Activity, User, Flame, Dumbbell } from 'lucide-react';
import { INITIAL_APP_DATA } from '../constants';

interface SetupWizardProps {
  onComplete: (data: Partial<AppData>) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form State
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('$');
  
  const [bankBalance, setBankBalance] = useState('');
  const [payday, setPayday] = useState('1'); 
  
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active'>('moderate');

  // Handlers
  const handleNext = () => {
    if (step < totalSteps) {
        setStep(step + 1);
    } else {
        finishSetup();
    }
  };

  const finishSetup = () => {
    // 1. Profile
    const userProfile: UserProfile = {
        ...INITIAL_APP_DATA.userProfile,
        name: name || 'Commander',
        currency: currency,
        payday: parseInt(payday)
    };

    // 2. Initial Bank Account
    const initialBank: BankAccount[] = bankBalance ? [{
        id: 'main_account',
        name: 'Primary Checking',
        balance: parseFloat(bankBalance)
    }] : [];

    // 3. Fitness Goals Logic
    // Base BMR estimate (very rough generic baseline)
    let baseCals = 2000;
    
    // Adjust for activity
    if (activityLevel === 'sedentary') baseCals = 1800;
    if (activityLevel === 'moderate') baseCals = 2300;
    if (activityLevel === 'active') baseCals = 2800;

    // Adjust for goal
    if (goalType === 'lose') baseCals -= 400;
    if (goalType === 'gain') baseCals += 300;

    // Clamp limits
    baseCals = Math.max(1200, Math.min(4000, baseCals));

    // Macro Split Calculation
    // High protein for losing or gaining
    const protein = (goalType === 'lose' || goalType === 'gain') ? 180 : 150;
    
    // Fat ~0.3-0.35g per calorie roughly, simplified logic
    const fats = Math.round((baseCals * 0.3) / 9);
    
    // Remainder carbs
    const carbs = Math.round((baseCals - (protein * 4) - (fats * 9)) / 4);

    let goals: FitnessGoals = { 
        ...INITIAL_APP_DATA.fitnessGoals,
        calorieGoal: baseCals,
        proteinGoal: protein,
        fatGoal: fats,
        carbGoal: carbs,
        weeklySessionTarget: activityLevel === 'active' ? 5 : activityLevel === 'moderate' ? 3 : 2,
        stepGoal: activityLevel === 'active' ? 10000 : activityLevel === 'moderate' ? 8000 : 5000
    };

    onComplete({
        userProfile,
        bankAccounts: initialBank,
        fitnessGoals: goals,
        initialized: true
    });
  };

  const getStepTitle = () => {
      switch(step) {
          case 1: return "Identity";
          case 2: return "Financials";
          case 3: return "Physique";
          default: return "Setup";
      }
  };

  const getStepIcon = () => {
    switch(step) {
        case 1: return <User size={24} className="text-accent" />;
        case 2: return <Wallet size={24} className="text-primary" />;
        case 3: return <Activity size={24} className="text-alert" />;
        default: return null;
    }
  };

  // Helper for ordinal dates
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in relative">
        
        {/* Background blobs - Fixed position to cover screen and avoid affecting flow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-sm z-10 flex flex-col items-center my-auto">
            {/* Header */}
            <div className="text-center mb-6 w-full">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300">
                        {getStepIcon()}
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{getStepTitle()}</h1>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-accent' : i < step ? 'w-4 bg-accent/50' : 'w-2 bg-border'}`} />
                    ))}
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-xl mb-6 min-h-[380px] w-full flex flex-col animate-slide-up">
                
                <div className="flex-1 space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-textSecondary text-center">
                                Welcome to your Life Command Center.<br/>First, let's get the basics down.
                            </p>
                            <Input 
                                label="Display Name" 
                                placeholder="e.g. Tony Stark"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoFocus
                            />
                            <Select 
                                label="Primary Currency"
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                            >
                                <option value="$">USD ($)</option>
                                <option value="€">EUR (€)</option>
                                <option value="£">GBP (£)</option>
                                <option value="¥">JPY (¥)</option>
                                <option value="₹">INR (₹)</option>
                                <option value="AED">AED (AED)</option>
                                <option value="CAD">CAD ($)</option>
                                <option value="AUD">AUD ($)</option>
                            </Select>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                             <p className="text-sm text-textSecondary text-center">
                                Establish your financial baseline to track net worth and budgeting cycles.
                            </p>
                            <Input 
                                label="Total Cash & Bank Balance" 
                                type="number"
                                placeholder="0.00"
                                value={bankBalance}
                                onChange={e => setBankBalance(e.target.value)}
                                autoFocus
                            />
                            
                            <Select 
                                label="Payday / Cycle Start"
                                value={payday}
                                onChange={e => setPayday(e.target.value)}
                            >
                                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{getOrdinal(day)} of the month</option>
                                ))}
                            </Select>
                            
                            <p className="text-[10px] text-textSecondary italic mt-1">
                                * Your monthly budget will reset on this day.
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <label className="block text-xs text-textSecondary ml-1 font-medium">Primary Goal</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'lose', label: 'Lose', icon: Flame }, 
                                        { id: 'maintain', label: 'Tone', icon: Activity }, 
                                        { id: 'gain', label: 'Build', icon: Dumbbell }
                                    ].map(opt => (
                                        <button 
                                            key={opt.id}
                                            onClick={() => setGoalType(opt.id as any)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                                                goalType === opt.id 
                                                ? 'bg-accent/20 border-accent text-white' 
                                                : 'bg-background/50 border-border text-textSecondary hover:bg-white/5'
                                            }`}
                                        >
                                            <opt.icon size={18} className="mb-1" />
                                            <span className="text-xs font-bold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs text-textSecondary ml-1 font-medium">Activity Level</label>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setActivityLevel('sedentary')}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                                            activityLevel === 'sedentary' ? 'bg-primary/20 border-primary' : 'bg-background/50 border-border'
                                        }`}
                                    >
                                        <div>
                                            <span className={`text-xs font-bold block ${activityLevel === 'sedentary' ? 'text-primary' : 'text-textPrimary'}`}>Sedentary</span>
                                            <span className="text-[10px] text-textSecondary">Desk job, little exercise</span>
                                        </div>
                                        {activityLevel === 'sedentary' && <Check size={14} className="text-primary"/>}
                                    </button>

                                    <button 
                                        onClick={() => setActivityLevel('moderate')}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                                            activityLevel === 'moderate' ? 'bg-primary/20 border-primary' : 'bg-background/50 border-border'
                                        }`}
                                    >
                                        <div>
                                            <span className={`text-xs font-bold block ${activityLevel === 'moderate' ? 'text-primary' : 'text-textPrimary'}`}>Moderate</span>
                                            <span className="text-[10px] text-textSecondary">1-3 workouts per week</span>
                                        </div>
                                        {activityLevel === 'moderate' && <Check size={14} className="text-primary"/>}
                                    </button>

                                    <button 
                                        onClick={() => setActivityLevel('active')}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                                            activityLevel === 'active' ? 'bg-primary/20 border-primary' : 'bg-background/50 border-border'
                                        }`}
                                    >
                                        <div>
                                            <span className={`text-xs font-bold block ${activityLevel === 'active' ? 'text-primary' : 'text-textPrimary'}`}>Active</span>
                                            <span className="text-[10px] text-textSecondary">4+ workouts, active job</span>
                                        </div>
                                        {activityLevel === 'active' && <Check size={14} className="text-primary"/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 mt-4 border-t border-border/50">
                    <Button fullWidth onClick={handleNext} disabled={step === 1 && !name}>
                        {step === totalSteps ? 'LAUNCH DASHBOARD' : 'NEXT STEP'}
                        {step !== totalSteps && <ArrowRight size={16} className="ml-2" />}
                    </Button>
                </div>

            </div>
            
            {/* Skip Option */}
            <div className="text-center">
                <button 
                    onClick={finishSetup}
                    className="text-xs text-textMuted hover:text-textSecondary transition-colors"
                >
                    Use default settings
                </button>
            </div>
        </div>
    </div>
  );
};