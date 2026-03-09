import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Wallet, Heart, Bell, Palette, Database, ChevronDown, ChevronUp,
  Save, Trash2, Download, Upload, Key
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsSection: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-display font-bold text-earth-900">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-earth-400" /> : <ChevronDown className="w-4 h-4 text-earth-400" />}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 space-y-4 border-t border-cream-200"
        >
          <div className="pt-4">{children}</div>
        </motion.div>
      )}
    </Card>
  );
};

export const SettingsPage: React.FC = () => {
  const { money, health, settings, setMoney, setHealth, setSettings, resetAll } = useAppStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey ?? '');
  const [keySaved, setKeySaved] = useState(false);

  // Money settings
  const [income, setIncome] = useState(money.monthlyIncome?.toString() ?? '');
  const [currency, setCurrency] = useState(money.currency ?? 'AED');

  // Health settings
  const [calorieGoal, setCalorieGoal] = useState(health.dailyCalorieGoal?.toString() ?? '2000');
  const [proteinGoal, setProteinGoal] = useState(health.dailyProteinGoal?.toString() ?? '150');
  const [stepGoal, setStepGoal] = useState(health.dailyStepGoal?.toString() ?? '10000');

  const handleSaveApiKey = () => {
    setSettings({ geminiApiKey: geminiKey.trim() });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleSaveMoney = () => {
    setMoney({
      monthlyIncome: parseFloat(income) || 0,
      currency,
    });
  };

  const handleSaveHealth = () => {
    setHealth({
      dailyCalorieGoal: parseInt(calorieGoal) || 2000,
      dailyProteinGoal: parseInt(proteinGoal) || 150,
      dailyStepGoal: parseInt(stepGoal) || 10000,
    });
  };

  const handleExport = () => {
    const data = JSON.stringify(useAppStore.getState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-command-centre-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    resetAll();
    setShowResetConfirm(false);
    window.location.reload();
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 pb-6">
      {/* Profile */}
      <motion.div variants={item}>
        <SettingsSection title="Profile" icon={<User className="w-5 h-5 text-sage-600" />} defaultOpen>
          <Input
            label="Display Name"
            placeholder="Your name"
            value={settings.displayName ?? ''}
            onChange={(e) => setSettings({ displayName: e.target.value })}
          />
        </SettingsSection>
      </motion.div>

      {/* AI Settings */}
      <motion.div variants={item}>
        <SettingsSection title="AI Assistant" icon={<Key className="w-5 h-5 text-amber-600" />}>
          <Input
            label="Gemini API Key"
            type="password"
            placeholder="Enter your API key"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
          />
          <p className="text-xs text-earth-400 mt-1">
            Used for AI meal logging and workout parsing. Get a free key from Google AI Studio.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveApiKey}
            icon={<Save className="w-3.5 h-3.5" />}
            className="mt-2"
          >
            {keySaved ? 'Saved!' : 'Save Key'}
          </Button>
        </SettingsSection>
      </motion.div>

      {/* Money Settings */}
      <motion.div variants={item}>
        <SettingsSection title="Money" icon={<Wallet className="w-5 h-5 text-sage-600" />}>
          <Input
            label="Monthly Income"
            type="number"
            placeholder="15000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Currency</label>
            <div className="flex gap-2">
              {['AED', 'USD', 'EUR', 'GBP', 'SAR'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-garden text-sm font-medium transition-all ${
                    currency === c ? 'bg-sage-500 text-white' : 'bg-cream-100 text-earth-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleSaveMoney} icon={<Save className="w-3.5 h-3.5" />}>
            Save
          </Button>
        </SettingsSection>
      </motion.div>

      {/* Health Settings */}
      <motion.div variants={item}>
        <SettingsSection title="Health Goals" icon={<Heart className="w-5 h-5 text-rose-500" />}>
          <Input label="Daily Calorie Goal" type="number" value={calorieGoal} onChange={(e) => setCalorieGoal(e.target.value)} />
          <Input label="Daily Protein Goal (g)" type="number" value={proteinGoal} onChange={(e) => setProteinGoal(e.target.value)} />
          <Input label="Daily Step Goal" type="number" value={stepGoal} onChange={(e) => setStepGoal(e.target.value)} />
          <Button variant="primary" size="sm" onClick={handleSaveHealth} icon={<Save className="w-3.5 h-3.5" />}>
            Save Goals
          </Button>
        </SettingsSection>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item}>
        <SettingsSection title="Notifications" icon={<Bell className="w-5 h-5 text-amber-600" />}>
          <div className="space-y-3">
            {[
              { key: 'mealReminders', label: 'Meal reminders' },
              { key: 'workoutReminders', label: 'Workout reminders' },
              { key: 'budgetAlerts', label: 'Budget alerts' },
              { key: 'gardenUpdates', label: 'Garden updates' },
            ].map((notif) => (
              <label key={notif.key} className="flex items-center justify-between">
                <span className="text-sm text-earth-700">{notif.label}</span>
                <input
                  type="checkbox"
                  checked={(settings.notifications as any)?.[notif.key] ?? true}
                  onChange={(e) =>
                    setSettings({
                      notifications: {
                        ...(settings.notifications ?? {}),
                        [notif.key]: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 rounded text-sage-500 border-cream-300 focus:ring-sage-500"
                />
              </label>
            ))}
          </div>
        </SettingsSection>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={item}>
        <SettingsSection title="Data" icon={<Database className="w-5 h-5 text-earth-500" />}>
          <div className="space-y-3">
            <Button variant="secondary" fullWidth onClick={handleExport} icon={<Download className="w-4 h-4" />}>
              Export Backup
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setShowResetConfirm(true)}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Reset All Data
            </Button>
            <p className="text-xs text-earth-400 text-center">
              This will permanently delete all your data including financial records, health logs, and garden progress.
            </p>
          </div>
        </SettingsSection>
      </motion.div>

      {/* Version */}
      <motion.div variants={item} className="text-center py-4">
        <p className="text-xs text-earth-400">Life Command Centre v2.0</p>
        <p className="text-xs text-earth-300">Built with love and garden vibes</p>
      </motion.div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This will permanently erase everything. Your garden, finances, and health data will all be lost. Are you sure?"
        confirmLabel="Reset Everything"
        variant="danger"
      />
    </motion.div>
  );
};
