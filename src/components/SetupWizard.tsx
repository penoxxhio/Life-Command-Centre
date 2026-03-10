import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './ui';
import { CreatureSprite } from '../features/creature/CreatureSprite';
import { SPECIES_CONFIG } from '../features/creature/creatureConfig';
import { createCreature } from '../features/creature/creatureService';
import { useAppStore } from '../store/useAppStore';
import type { CreatureSpecies } from '../types';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20ac)' },
  { value: 'GBP', label: 'GBP (\u00a3)' },
  { value: 'AED', label: 'AED (\u062f.\u0625)' },
  { value: 'SAR', label: 'SAR (\ufdfc)' },
  { value: 'INR', label: 'INR (\u20b9)' },
  { value: 'JPY', label: 'JPY (\u00a5)' },
];

const STEPS = ['identity', 'creature', 'goals', 'ready'] as const;

export function SetupWizard() {
  const completeSetup = useAppStore((s) => s.completeSetup);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [species, setSpecies] = useState<CreatureSpecies>('fox');
  const [creatureName, setCreatureName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('2200');
  const [proteinGoal, setProteinGoal] = useState('150');
  const [workoutGoal, setWorkoutGoal] = useState('4');

  const previewCreature = createCreature(species, creatureName || 'Buddy');

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return creatureName.trim().length > 0;
    return true;
  };

  const handleFinish = () => {
    completeSetup(
      { name: name.trim(), currency },
      species,
      creatureName.trim()
    );
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-void-100 mb-2">
          Life Command Centre
        </h1>
        <p className="text-void-400 text-sm">Your personal life operating system</p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-neon-500' : i < step ? 'w-4 bg-neon-500/40' : 'w-4 bg-white/[0.08]'
            }`}
            layout
          />
        ))}
      </div>

      {/* Step content */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait" custom={1}>
          {/* Step 1: Identity */}
          {step === 0 && (
            <motion.div key="identity" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <GlassCard variant="heavy" padding="lg">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="font-display text-xl font-semibold text-void-100">Who are you?</h2>
                    <p className="text-void-400 text-sm mt-1">Let's get the basics set up</p>
                  </div>
                  <GlassInput
                    label="Your Name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  <GlassSelect
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    options={CURRENCIES}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 2: Creature */}
          {step === 1 && (
            <motion.div key="creature" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <GlassCard variant="heavy" padding="lg">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="font-display text-xl font-semibold text-void-100">Choose Your Companion</h2>
                    <p className="text-void-400 text-sm mt-1">This creature grows with your habits</p>
                  </div>

                  {/* Species picker */}
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(SPECIES_CONFIG) as CreatureSpecies[]).map((sp) => {
                      const cfg = SPECIES_CONFIG[sp];
                      return (
                        <motion.button
                          key={sp}
                          onClick={() => setSpecies(sp)}
                          className={`
                            flex flex-col items-center gap-1 p-3 rounded-glass border transition-all
                            ${species === sp
                              ? 'bg-white/[0.06] border-neon-500/30 shadow-neon'
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-2xl">{cfg.emoji}</span>
                          <span className="text-[9px] text-void-300 font-medium">{cfg.name.split(' ')[0]}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Species description */}
                  <p className="text-center text-xs text-void-400">
                    {SPECIES_CONFIG[species].description}
                  </p>

                  {/* Preview */}
                  <div className="flex justify-center">
                    <CreatureSprite creature={previewCreature} size="md" showMood={false} interactive={false} />
                  </div>

                  <GlassInput
                    label="Creature Name"
                    placeholder="Name your companion"
                    value={creatureName}
                    onChange={(e) => setCreatureName(e.target.value)}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 3: Goals */}
          {step === 2 && (
            <motion.div key="goals" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <GlassCard variant="heavy" padding="lg">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="font-display text-xl font-semibold text-void-100">Set Your Targets</h2>
                    <p className="text-void-400 text-sm mt-1">These can be changed anytime in Settings</p>
                  </div>
                  <GlassInput
                    label="Monthly Income"
                    type="number"
                    placeholder="0"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    suffix={currency}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <GlassInput
                      label="Daily Calories"
                      type="number"
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(e.target.value)}
                      suffix="kcal"
                    />
                    <GlassInput
                      label="Daily Protein"
                      type="number"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(e.target.value)}
                      suffix="g"
                    />
                  </div>
                  <GlassInput
                    label="Weekly Workouts"
                    type="number"
                    value={workoutGoal}
                    onChange={(e) => setWorkoutGoal(e.target.value)}
                    suffix="sessions"
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 4: Ready */}
          {step === 3 && (
            <motion.div key="ready" variants={slideVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <GlassCard variant="neon" padding="lg" glow>
                <div className="space-y-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                  >
                    <Sparkles size={48} className="text-neon-400 mx-auto" />
                  </motion.div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-void-100">Ready to go, {name}!</h2>
                    <p className="text-void-400 text-sm mt-2">
                      {creatureName} the {SPECIES_CONFIG[species].name} is waiting for you.
                      Stay consistent and watch them evolve!
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <CreatureSprite creature={previewCreature} size="lg" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <GlassButton
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            icon={<ChevronLeft size={16} />}
          >
            Back
          </GlassButton>

          {step < 3 ? (
            <GlassButton
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              iconRight={<ChevronRight size={16} />}
            >
              Next
            </GlassButton>
          ) : (
            <GlassButton
              variant="primary"
              onClick={handleFinish}
              icon={<Sparkles size={16} />}
            >
              Launch
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
}
