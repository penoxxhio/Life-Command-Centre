import React, { useState } from 'react';
import { AppData, UserProfile, BankAccount, FitnessGoals, DebtAccount } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  Check, ArrowRight, Wallet, Activity, User, 
  Flame, Dumbbell, Heart, Zap, Plus, Trash2, 
  CreditCard, Utensils 
} from 'lucide-react';
import { INITIAL_APP_DATA } from '../constants';

interface SetupWizardProps {
  onComplete: (data: Partial<AppData>) => void;
}

// --- Types & Constants for Wizard ---

type FitnessGoalType = 'hypertrophy' | 'fatloss' | 'endurance' | 'health';
type DietType = 'standard' | 'keto' | 'vegan' | 'high_protein';

interface TempDebt {
  id: string;
  name: string;
  balance: string;
  limit: string;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // --- Form State ---

  // Step 1: Identity
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('$');

  // Step 2: Financials
  const [bankBalance, setBankBalance] = useState('');
  const [payday, setPayday] = useState('1'); 
  const [debts, setDebts] = useState<TempDebt[]>([]);
  const [tempDebtName, setTempDebtName] = useState('');
  const [tempDebtBal, setTempDebtBal] = useState('');
  const [tempDebtLimit, setTempDebtLimit] = useState('');

  // Step 3: Body & Engine
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoalType>('health');
  const [dietType, setDietType] = useState<DietType>('standard');

  // --- Logic Helpers ---

  const addDebt = () => {
    if (!tempDebtName || !tempDebtBal) return;
    const newDebt: TempDebt = {
        id: Math.random().toString(36).substr(2, 9),
        name: tempDebtName,
        balance: tempDebtBal,
        limit: tempDebtLimit || tempDebtBal // Default limit to balance if empty (maxed out)
    };
    setDebts([...debts, newDebt]);
    setTempDebtName('');
    setTempDebtBal('');
    setTempDebtLimit('');
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

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

    // 2. Financials
    const initialBank: BankAccount[] = bankBalance ? [{
        id: 'main_account',
        name: 'Primary Checking',
        balance: parseFloat(bankBalance)
    }] : [];

    const debtAccounts: DebtAccount[] = debts.map((d, idx) => ({
        id: d.id,
        name: d.name,
        currentBalance: parseFloat(d.balance),
        startingBalance: parseFloat(d.limit),
        interestRate: 0,
        minPayment: 0,
        color: ['#F85149', '#D29922', '#A371F7', '#58A6FF'][idx % 4]
    }));

    // 3. Fitness & Nutrition Logic
    let baseCals = 2000;
    
    // Activity Multiplier (Rough Estimate)
    if (activityLevel === 'sedentary') baseCals = 1800;
    if (activityLevel === 'moderate') baseCals = 2400;
    if (activityLevel === 'active') baseCals = 2900;

    // Goal Adjustments
    if (fitnessGoal === 'fatloss') baseCals -= 500;
    if (fitnessGoal === 'hypertrophy') baseCals += 300;
    if (fitnessGoal === 'endurance') baseCals += 200;

    // Clamp
    baseCals = Math.max(1200, Math.min(4500, baseCals));

    // Macro Split
    let protein = 150;
    let fats = 70;
    let carbs = 200;

    // Diet Logic overrides
    if (dietType === 'keto') {
        carbs = 30;
        protein = 160;
        fats = Math.round((baseCals - (protein * 4) - (carbs * 4)) / 9);
    } else if (dietType === 'high_protein' || fitnessGoal === 'hypertrophy') {
        protein = Math.max(180, Math.round(baseCals * 0.35 / 4));
        fats = Math.round(baseCals * 0.25 / 9);
        carbs = Math.round((baseCals - (protein * 4) - (fats * 9)) / 4);
    } else if (dietType === 'vegan') {
        protein = 140; // Harder to hit super high protein on vegan sometimes, slightly lower baseline
        carbs = Math.round(baseCals * 0.5 / 4);
        fats = Math.round((baseCals - (protein * 4) - (carbs * 4)) / 9);
    } else {
        // Standard Balanced
        protein = Math.round(baseCals * 0.3 / 4);
        fats = Math.round(baseCals * 0.3 / 9);
        carbs = Math.round(baseCals * 0.4 / 4);
    }

    // Generate Custom Quick Chips based on Diet
    let quickChips = ["Chicken & Rice", "Oats", "Whey Protein", "Banana", "Eggs"];
    if (dietType === 'keto') quickChips = ["Steak", "Avocado", "Eggs", "Cheese", "Salmon"];
    if (dietType === 'vegan') quickChips = ["Tofu Scramble", "Lentil Soup", "Chickpeas", "Protein Shake (Pea)", "Quinoa"];
    
    const goals: FitnessGoals = { 
        ...INITIAL_APP_DATA.fitnessGoals,
        calorieGoal: Math.round(baseCals),
        proteinGoal: Math.round(protein),
        fatGoal: Math.round(fats),
        carbGoal: Math.round(carbs),
        weeklySessionTarget: activityLevel === 'active' ? 5 : activityLevel === 'moderate' ? 3 : 2,
        stepGoal: activityLevel === 'active' ? 10000 : activityLevel === 'moderate' ? 8000 : 5000
    };

    onComplete({
        userProfile,
        bankAccounts: initialBank,
        debtAccounts: debtAccounts,
        fitnessGoals: goals,
        nutritionQuickChips: quickChips,
        initialized: true
    });
  };

  const getStepTitle = () => {
      switch(step) {
          case 1: return "Identity";
          case 2: return "Financials";
          case 3: return "Training Goal";
          case 4: return "Nutrition";
          default: return "Setup";
      }
  };

  const getStepIcon = () => {
    switch(step) {
        case 1: return <User size={24} className="text-accent" />;
        case 2: return <Wallet size={24} className="text-primary" />;
        case 3: return <Activity size={24} className="text-alert" />;
        case 4: return <Utensils size={24} className="text-warning" />;
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
        
        {/* Background blobs */}
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
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-accent' : i < step ? 'w-4 bg-accent/50' : 'w-2 bg-border'}`} />
                    ))}
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-6 shadow-2xl mb-6 min-h-[440px] w-full flex flex-col animate-slide-up">
                
                <div className="flex-1 space-y-6">
                    {/* STEP 1: IDENTITY */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <p className="text-sm text-textSecondary text-center leading-relaxed">
                                Welcome to <strong>Life Command</strong>.<br/>Let's personalize your dashboard.
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

                    {/* STEP 2: FINANCIALS */}
                    {step === 2 && (
                        <div className="space-y-6">
                             <p className="text-sm text-textSecondary text-center">
                                Set your baseline assets and liabilities.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Input 
                                    label="Cash & Bank" 
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={bankBalance}
                                    onChange={e => setBankBalance(e.target.value)}
                                />
                                <Select 
                                    label="Payday"
                                    value={payday}
                                    onChange={e => setPayday(e.target.value)}
                                >
                                    {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>{getOrdinal(day)}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-border/50">
                                <label className="text-xs text-textSecondary font-medium block">Add Debt / Credit Cards</label>
                                
                                {/* New Unified Input Row */}
                                <div className="flex items-center gap-3 bg-background/40 p-1.5 rounded-xl border border-border/50 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all">
                                    <div className="flex-1">
                                        <input 
                                            className="w-full bg-transparent border-none px-3 py-2 text-sm text-white placeholder:text-textMuted focus:outline-none"
                                            placeholder="Card Name (e.g. Visa)"
                                            value={tempDebtName}
                                            onChange={e => setTempDebtName(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-px h-6 bg-border/50"></div>
                                    <div className="w-24">
                                        <input 
                                            className="w-full bg-transparent border-none px-3 py-2 text-sm text-white placeholder:text-textMuted focus:outline-none text-right"
                                            placeholder="Balance"
                                            type="number"
                                            inputMode="decimal"
                                            value={tempDebtBal}
                                            onChange={e => setTempDebtBal(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={addDebt} 
                                        className="h-[36px] w-[36px] flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                    {debts.map(debt => (
                                        <div key={debt.id} className="flex justify-between items-center bg-background/30 px-3 py-2.5 rounded-lg border border-border/30">
                                            <div className="flex items-center gap-2.5">
                                                <CreditCard size={14} className="text-alert"/>
                                                <span className="text-sm font-medium text-white">{debt.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-mono text-alert font-bold">-{debt.balance}</span>
                                                <button onClick={() => removeDebt(debt.id)} className="text-textSecondary hover:text-alert transition-colors p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {debts.length === 0 && (
                                        <div className="text-center py-3 border border-dashed border-border/30 rounded-lg">
                                            <p className="text-[10px] text-textSecondary italic">No debts added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: FITNESS GOALS */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <label className="block text-xs text-textSecondary ml-1 font-medium">Primary Goal</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setFitnessGoal('hypertrophy')}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all active:scale-[0.98] ${fitnessGoal === 'hypertrophy' ? 'bg-accent/20 border-accent text-white shadow-lg shadow-accent/10' : 'bg-background/50 border-border text-textSecondary hover:bg-background/80'}`}
                                    >
                                        <Dumbbell size={20} className="mb-2" />
                                        <span className="text-xs font-bold">Build Muscle</span>
                                    </button>
                                    <button 
                                        onClick={() => setFitnessGoal('fatloss')}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all active:scale-[0.98] ${fitnessGoal === 'fatloss' ? 'bg-alert/20 border-alert text-white shadow-lg shadow-alert/10' : 'bg-background/50 border-border text-textSecondary hover:bg-background/80'}`}
                                    >
                                        <Flame size={20} className="mb-2" />
                                        <span className="text-xs font-bold">Burn Fat</span>
                                    </button>
                                    <button 
                                        onClick={() => setFitnessGoal('endurance')}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all active:scale-[0.98] ${fitnessGoal === 'endurance' ? 'bg-info/20 border-info text-white shadow-lg shadow-info/10' : 'bg-background/50 border-border text-textSecondary hover:bg-background/80'}`}
                                    >
                                        <Zap size={20} className="mb-2" />
                                        <span className="text-xs font-bold">Endurance</span>
                                    </button>
                                    <button 
                                        onClick={() => setFitnessGoal('health')}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all active:scale-[0.98] ${fitnessGoal === 'health' ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' : 'bg-background/50 border-border text-textSecondary hover:bg-background/80'}`}
                                    >
                                        <Heart size={20} className="mb-2" />
                                        <span className="text-xs font-bold">General Health</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs text-textSecondary ml-1 font-medium">Activity Level</label>
                                <Select value={activityLevel} onChange={e => setActivityLevel(e.target.value as any)}>
                                    <option value="sedentary">Sedentary (Office Job)</option>
                                    <option value="moderate">Moderate (1-3 workouts/wk)</option>
                                    <option value="active">Active (4+ workouts/wk)</option>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: NUTRITION & DIET */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <p className="text-sm text-textSecondary text-center">
                                This helps the AI suggest relevant foods and macro splits.
                            </p>
                            
                            <div className="space-y-3">
                                <label className="block text-xs text-textSecondary ml-1 font-medium">Dietary Preference</label>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setDietType('standard')}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all hover:bg-background/80 ${dietType === 'standard' ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/5' : 'bg-background/50 border-border text-textSecondary'}`}
                                    >
                                        <span className="text-sm font-bold">Balanced / Standard</span>
                                        {dietType === 'standard' && <Check size={16} className="text-primary"/>}
                                    </button>
                                    <button 
                                        onClick={() => setDietType('high_protein')}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all hover:bg-background/80 ${dietType === 'high_protein' ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/5' : 'bg-background/50 border-border text-textSecondary'}`}
                                    >
                                        <span className="text-sm font-bold">High Protein</span>
                                        {dietType === 'high_protein' && <Check size={16} className="text-primary"/>}
                                    </button>
                                    <button 
                                        onClick={() => setDietType('keto')}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all hover:bg-background/80 ${dietType === 'keto' ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/5' : 'bg-background/50 border-border text-textSecondary'}`}
                                    >
                                        <span className="text-sm font-bold">Keto / Low Carb</span>
                                        {dietType === 'keto' && <Check size={16} className="text-primary"/>}
                                    </button>
                                    <button 
                                        onClick={() => setDietType('vegan')}
                                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all hover:bg-background/80 ${dietType === 'vegan' ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/5' : 'bg-background/50 border-border text-textSecondary'}`}
                                    >
                                        <span className="text-sm font-bold">Vegan / Plant Based</span>
                                        {dietType === 'vegan' && <Check size={16} className="text-primary"/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 mt-4 border-t border-border/50">
                    <Button fullWidth onClick={handleNext} disabled={step === 1 && !name} className="shadow-lg shadow-accent/20">
                        {step === totalSteps ? 'LAUNCH DASHBOARD' : 'NEXT STEP'}
                        {step !== totalSteps && <ArrowRight size={16} className="ml-2" />}
                    </Button>
                </div>

            </div>
            
            {/* Skip Option */}
            <div className="text-center">
                <button 
                    onClick={finishSetup}
                    className="text-xs text-textMuted hover:text-textSecondary transition-colors py-2 px-4"
                >
                    Skip & Use Default Settings
                </button>
            </div>
        </div>
    </div>
  );
};