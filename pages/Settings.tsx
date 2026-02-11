import React, { useState } from 'react';
import { AppData, BankAccount, BudgetCategory, DebtAccount, RecurringTransaction } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { exportData, importData } from '../services/storageService';
import { isAiReady } from '../services/geminiService';
import { 
  Download, Upload, Plus, Trash2, List, 
  ChevronRight, ArrowLeft, Wallet, Activity, Database, 
  Utensils, Moon, Target, CreditCard, Landmark, RefreshCw, Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';

interface SettingsProps {
  data: AppData;
  updateData: (data: Partial<AppData>) => void;
  onBack: () => void;
}

type SettingsSection = 'MAIN' | 'MONEY' | 'HEALTH' | 'DATA';

export const SettingsPage: React.FC<SettingsProps> = ({ data, updateData, onBack }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('MAIN');
  const aiAvailable = isAiReady();

  // --- Modal States ---
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  // --- Confirmation State ---
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // --- Form States ---
  const [bankName, setBankName] = useState('');
  const [bankBalance, setBankBalance] = useState('');
  
  const [debtName, setDebtName] = useState('');
  const [debtBalance, setDebtBalance] = useState('');
  const [debtStart, setDebtStart] = useState('');
  const [debtColor, setDebtColor] = useState('#C45C3A');

  const [catName, setCatName] = useState('');
  const [catBudget, setCatBudget] = useState('');
  const [catIcon, setCatIcon] = useState('💸');

  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [subcatInput, setSubcatInput] = useState('');

  // Recurring Form
  const [recType, setRecType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [recFrequency, setRecFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [recAmount, setRecAmount] = useState('');
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [recNote, setRecNote] = useState('');
  
  // Dynamic Rec Fields
  const [recCategory, setRecCategory] = useState(data.budgetConfig.livingCategories[0]?.name || '');
  const [recSource, setRecSource] = useState(data.bankAccounts[0]?.id || '');
  const [recDest, setRecDest] = useState(data.bankAccounts[0]?.id || '');
  const [recIncomeSource, setRecIncomeSource] = useState('');


  // --- Handlers ---

  const handleImport = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
              const text = await file.text();
              const imported = importData(text);
              if (imported) {
                  updateData(imported);
                  alert('Data imported successfully!');
              } else {
                  alert('Invalid file format.');
              }
          }
      };
      input.click();
  };

  const updateGoal = (key: keyof typeof data.fitnessGoals, value: string) => {
      updateData({
          fitnessGoals: {
              ...data.fitnessGoals,
              [key]: parseFloat(value) || 0
          }
      });
  };

  // Money Handlers
  const addBankAccount = () => {
      if (!bankName) return;
      const newAccount: BankAccount = { 
          id: Math.random().toString(36).substr(2, 9),
          name: bankName, 
          balance: parseFloat(bankBalance) || 0 
      };
      updateData({ bankAccounts: [...data.bankAccounts, newAccount] });
      setBankName(''); setBankBalance(''); setShowBankModal(false);
  };

  const confirmRemoveBank = (idx: number) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Bank Account',
          message: 'Are you sure you want to delete this bank account? This cannot be undone.',
          onConfirm: () => {
              const updated = [...data.bankAccounts];
              updated.splice(idx, 1);
              updateData({ bankAccounts: updated });
          }
      });
  };

  const addDebtAccount = () => {
      if (!debtName) return;
      const newDebt: DebtAccount = {
          id: Math.random().toString(36).substr(2, 9),
          name: debtName,
          currentBalance: parseFloat(debtBalance) || 0,
          startingBalance: parseFloat(debtStart) || parseFloat(debtBalance) || 1000,
          interestRate: 0,
          minPayment: 0,
          color: debtColor
      };
      updateData({ debtAccounts: [...data.debtAccounts, newDebt] });
      setDebtName(''); setDebtBalance(''); setDebtStart(''); setShowDebtModal(false);
  };

  const confirmRemoveDebt = (id: string) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Debt Account',
          message: 'Are you sure? This will delete the debt account and its history.',
          onConfirm: () => {
              updateData({ debtAccounts: data.debtAccounts.filter(d => d.id !== id) });
          }
      });
  };

  const addCategory = () => {
      if (!catName) return;
      const newCat: BudgetCategory = {
          name: catName,
          budget: parseFloat(catBudget) || 100,
          icon: catIcon,
          subcategories: []
      };
      updateData({
          budgetConfig: {
              ...data.budgetConfig,
              livingCategories: [...data.budgetConfig.livingCategories, newCat]
          }
      });
      setCatName(''); setCatBudget(''); setShowCatModal(false);
  };

  const confirmRemoveCategory = (idx: number) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Category',
          message: 'Delete this budget category? Expenses logged under it will remain but the category will be gone.',
          onConfirm: () => {
              const updated = [...data.budgetConfig.livingCategories];
              updated.splice(idx, 1);
              updateData({
                  budgetConfig: { ...data.budgetConfig, livingCategories: updated }
              });
          }
      });
  };

  const openSubcatModal = (idx: number) => {
      setActiveCategoryIndex(idx);
      setShowSubcatModal(true);
  };

  const addSubcategory = () => {
      if (activeCategoryIndex === null || !subcatInput) return;
      const cats = [...data.budgetConfig.livingCategories];
      const cat = cats[activeCategoryIndex];
      const subs = cat.subcategories ? [...cat.subcategories, subcatInput] : [subcatInput];
      cats[activeCategoryIndex] = { ...cat, subcategories: subs };
      
      updateData({
          budgetConfig: { ...data.budgetConfig, livingCategories: cats }
      });
      setSubcatInput('');
  };

  const removeSubcategory = (subIdx: number) => {
      if (activeCategoryIndex === null) return;
      const cats = [...data.budgetConfig.livingCategories];
      const cat = cats[activeCategoryIndex];
      if (!cat.subcategories) return;

      const subs = [...cat.subcategories];
      subs.splice(subIdx, 1);
      cats[activeCategoryIndex] = { ...cat, subcategories: subs };
      
      updateData({
          budgetConfig: { ...data.budgetConfig, livingCategories: cats }
      });
  };

  const addRecurring = () => {
      if (!recAmount) return;

      const newRule: RecurringTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: recType,
          frequency: recFrequency,
          startDate: recDate,
          nextDueDate: recDate,
          amount: parseFloat(recAmount),
          note: recNote,
          active: true,
          // Conditionally add fields
          ...(recType === 'expense' && { categoryName: recCategory, sourceAccountId: recSource }),
          ...(recType === 'income' && { sourceName: recIncomeSource, toAccountId: recDest }),
          ...(recType === 'transfer' && { sourceAccountId: recSource, toAccountId: recDest })
      };

      const existingRules = data.recurringTransactions || [];
      updateData({ recurringTransactions: [...existingRules, newRule] });
      setShowRecurringModal(false);
      setRecAmount('');
      setRecNote('');
  };

  const confirmRemoveRecurring = (id: string) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Recurring Rule',
          message: 'Stop this recurring transaction? Past transactions generated by it will be kept.',
          onConfirm: () => {
              updateData({ recurringTransactions: data.recurringTransactions.filter(r => r.id !== id) });
          }
      });
  };

  // --- Sub-Components for cleanliness ---

  const MenuButton = ({ icon: Icon, label, onClick, subtext }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-border/30 transition-all active:scale-[0.98] group mb-3"
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-background rounded-lg text-accent group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="font-bold text-sm text-textPrimary">{label}</p>
          {subtext && <p className="text-xs text-textSecondary">{subtext}</p>}
        </div>
      </div>
      <ChevronRight size={16} className="text-textSecondary group-hover:text-white transition-colors" />
    </button>
  );

  // --- Render Views ---

  const renderMainMenu = () => (
    <div className="space-y-1 animate-slide-up">
       <div className="mb-6 px-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
          <p className="text-sm text-textSecondary">Manage your preferences</p>
       </div>

       <MenuButton 
          icon={Wallet} 
          label="Money & Assets" 
          subtext="Banks, Debts, Rules"
          onClick={() => setActiveSection('MONEY')} 
       />
       <MenuButton 
          icon={Activity} 
          label="Health & Fitness" 
          subtext="Macros, Goals, Sleep"
          onClick={() => setActiveSection('HEALTH')} 
       />
       <MenuButton 
          icon={Database} 
          label="Data & Backup" 
          subtext="Import, Export, Reset"
          onClick={() => setActiveSection('DATA')} 
       />

       {/* AI Status Mini Card */}
       <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between transition-colors ${aiAvailable ? 'bg-accent/5 border-accent/20' : 'bg-alert/5 border-alert/20'}`}>
          <div className="flex items-center gap-3">
             <Sparkles size={20} className={aiAvailable ? 'text-accent' : 'text-textMuted'} />
             <div>
                <p className="text-xs font-bold text-textPrimary">AI Engine Status</p>
                <p className="text-[10px] text-textSecondary">{aiAvailable ? 'Connected via System Environment' : 'Disconnected (Check Netlify Env)'}</p>
             </div>
          </div>
          {aiAvailable ? <CheckCircle2 size={16} className="text-accent" /> : <AlertCircle size={16} className="text-alert" />}
       </div>

       <div className="pt-8 text-center">
          <p className="text-[10px] text-textSecondary font-mono uppercase tracking-widest opacity-40">Life Command Center v2.1</p>
      </div>
    </div>
  );

  const renderMoneySettings = () => (
    <div className="space-y-6 animate-slide-up pb-20">
      {/* Banks */}
      <Card title="BANK ACCOUNTS" action={
          <button onClick={() => setShowBankModal(true)} className="text-accent hover:text-white p-1 bg-card border border-border rounded"><Plus size={16} /></button>
      }>
          <div className="space-y-2">
              {data.bankAccounts.map((acc, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                          <Landmark size={16} className="text-textSecondary" />
                          <span className="text-sm font-medium">{acc.name}</span>
                      </div>
                      <button onClick={() => confirmRemoveBank(idx)} className="text-textSecondary hover:text-alert p-3"><Trash2 size={14}/></button>
                  </div>
              ))}
              {data.bankAccounts.length === 0 && <p className="text-xs text-textSecondary text-center py-2">No accounts added.</p>}
          </div>
      </Card>

      {/* Debts */}
      <Card title="DEBT ACCOUNTS" action={
          <button onClick={() => setShowDebtModal(true)} className="text-accent hover:text-white p-1 bg-card border border-border rounded"><Plus size={16} /></button>
      }>
          <div className="space-y-2">
              {data.debtAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                          <CreditCard size={16} style={{color: acc.color}} />
                          <span className="text-sm font-bold" style={{color: acc.color}}>{acc.name}</span>
                      </div>
                      <button onClick={() => confirmRemoveDebt(acc.id)} className="text-textSecondary hover:text-alert p-3"><Trash2 size={14}/></button>
                  </div>
              ))}
          </div>
      </Card>

      {/* Recurring Rules */}
      <Card title="RECURRING RULES" action={
          <button onClick={() => setShowRecurringModal(true)} className="text-accent hover:text-white p-1 bg-card border border-border rounded"><Plus size={16} /></button>
      }>
          <div className="space-y-2">
              {data.recurringTransactions?.map((rule) => (
                  <div key={rule.id} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                          <RefreshCw size={16} className="text-textSecondary" />
                          <div>
                              <p className="text-sm font-bold text-textPrimary capitalize">{rule.note || rule.type}</p>
                              <p className="text-[10px] text-textSecondary capitalize">{rule.frequency} • {rule.amount}</p>
                          </div>
                      </div>
                      <button onClick={() => confirmRemoveRecurring(rule.id)} className="text-textSecondary hover:text-alert p-3"><Trash2 size={14}/></button>
                  </div>
              ))}
              {(!data.recurringTransactions || data.recurringTransactions.length === 0) && (
                  <p className="text-xs text-textSecondary text-center py-2">No recurring rules.</p>
              )}
          </div>
      </Card>

      {/* Categories */}
      <Card title="BUDGET CATEGORIES" action={
          <button onClick={() => setShowCatModal(true)} className="text-accent hover:text-white p-1 bg-card border border-border rounded"><Plus size={16} /></button>
      }>
          <div className="space-y-2">
              {data.budgetConfig.livingCategories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => openSubcatModal(idx)} className="text-textSecondary hover:text-white p-2"><List size={14}/></button>
                          <button onClick={() => confirmRemoveCategory(idx)} className="text-textSecondary hover:text-alert p-2"><Trash2 size={14}/></button>
                      </div>
                  </div>
              ))}
          </div>
      </Card>
    </div>
  );

  const renderHealthSettings = () => (
    <div className="space-y-6 animate-slide-up pb-20">
      <Card title="NUTRITION TARGETS">
          <div className="flex items-center gap-2 mb-4 text-accent">
            <Utensils size={16} />
            <span className="text-sm font-bold">Daily Macros</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <Input 
                  label="Calories"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.calorieGoal} onChange={e => updateGoal('calorieGoal', e.target.value)} 
              />
              <Input 
                  label="Protein (g)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.proteinGoal} onChange={e => updateGoal('proteinGoal', e.target.value)} 
              />
              <Input 
                  label="Carbs (g)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.carbGoal} onChange={e => updateGoal('carbGoal', e.target.value)} 
              />
              <Input 
                  label="Fats (g)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.fatGoal} onChange={e => updateGoal('fatGoal', e.target.value)} 
              />
              <Input 
                  label="Fiber (g)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.fiberGoal} onChange={e => updateGoal('fiberGoal', e.target.value)} 
              />
              <Input 
                  label="Sugar Limit (g)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.sugarLimit} onChange={e => updateGoal('sugarLimit', e.target.value)} 
              />
          </div>
      </Card>

      <Card title="FITNESS GOALS">
          <div className="flex items-center gap-2 mb-4 text-info">
            <Target size={16} />
            <span className="text-sm font-bold">Activity & Recovery</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <Input 
                  label="Weekly Workouts"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.weeklySessionTarget} onChange={e => updateGoal('weeklySessionTarget', e.target.value)} 
              />
              <Input 
                  label="Sleep Goal (hrs)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.sleepGoal} onChange={e => updateGoal('sleepGoal', e.target.value)} 
              />
              <Input 
                  label="Apple Move (kcal)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.moveGoal} onChange={e => updateGoal('moveGoal', e.target.value)} 
              />
              <Input 
                  label="Apple Exercise (min)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.exerciseGoal} onChange={e => updateGoal('exerciseGoal', e.target.value)} 
              />
              <Input 
                  label="Apple Stand (hrs)"
                  type="number" inputMode="numeric"
                  value={data.fitnessGoals.standGoal} onChange={e => updateGoal('standGoal', e.target.value)} 
              />
          </div>
      </Card>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6 animate-slide-up">
      <Card title="AI ENGINE CONFIG">
          <div className="flex items-center gap-3 mb-3">
             <Sparkles size={18} className={aiAvailable ? 'text-accent' : 'text-alert'} />
             <span className="text-sm font-bold">Gemini Status: {aiAvailable ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
          <p className="text-xs text-textSecondary leading-relaxed mb-4">
            {aiAvailable 
              ? "The AI engine is correctly configured via the secure environment variable API_KEY. All smart features (Food Analysis, Workout Parsing) are active."
              : "The API_KEY is missing from the system environment. To enable AI features, you must add an API_KEY variable in your deployment dashboard (e.g., Netlify Environment Variables)."}
          </p>
          {!aiAvailable && (
            <div className="bg-card p-3 rounded-lg border border-border/50 font-mono text-[10px] text-textSecondary">
              TIP: Security guidelines prevent manual key entry. Set 'API_KEY' in your Netlify site settings.
            </div>
          )}
      </Card>

      <Card title="BACKUP & RESTORE">
          <p className="text-xs text-textSecondary mb-4 leading-relaxed">
            Export your entire database to a JSON file for backup. You can restore it later on any device.
          </p>
          <div className="space-y-3">
              <Button variant="secondary" fullWidth onClick={() => exportData(data, 'file')}>
                  <Download size={16} className="mr-2" /> EXPORT FULL BACKUP
              </Button>
              <Button variant="ghost" fullWidth onClick={handleImport}>
                  <Upload size={16} className="mr-2" /> IMPORT BACKUP
              </Button>
          </div>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center mb-4">
         {activeSection !== 'MAIN' && (
             <button onClick={() => setActiveSection('MAIN')} className="mr-3 p-2 hover:bg-card rounded-full transition-colors text-textSecondary">
                 <ArrowLeft size={20} />
             </button>
         )}
         {activeSection !== 'MAIN' && (
             <h2 className="text-lg font-bold text-textPrimary capitalize">
                 {activeSection === 'MONEY' ? 'Money Management' : activeSection === 'HEALTH' ? 'Health Goals' : 'Data Management'}
             </h2>
         )}
      </div>

      {/* Content */}
      <div className="flex-1">
          {activeSection === 'MAIN' && renderMainMenu()}
          {activeSection === 'MONEY' && renderMoneySettings()}
          {activeSection === 'HEALTH' && renderHealthSettings()}
          {activeSection === 'DATA' && renderDataSettings()}
      </div>

      {/* --- MODALS --- */}

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen} 
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
      />

      {/* Bank Modal */}
      <Modal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="Add Bank Account">
          <div className="space-y-4">
              <Input 
                  label="Account Name"
                  value={bankName} onChange={e => setBankName(e.target.value)} 
              />
              <Input 
                  label="Current Balance"
                  type="number" inputMode="decimal"
                  value={bankBalance} onChange={e => setBankBalance(e.target.value)} 
              />
              <Button fullWidth onClick={addBankAccount} className="mt-2">Add Account</Button>
          </div>
      </Modal>

      {/* Debt Modal */}
      <Modal isOpen={showDebtModal} onClose={() => setShowDebtModal(false)} title="Add Debt Account">
          <div className="space-y-4">
              <Input 
                  label="Card/Loan Name"
                  value={debtName} onChange={e => setDebtName(e.target.value)} 
              />
              <Input 
                  label="Current Balance"
                  type="number" inputMode="decimal"
                  value={debtBalance} onChange={e => setDebtBalance(e.target.value)} 
              />
              <Input 
                  label="Starting Balance (Limit)"
                  type="number" inputMode="decimal"
                  value={debtStart} onChange={e => setDebtStart(e.target.value)} 
              />
              <div>
                <label className="block text-xs text-textSecondary mb-1.5 ml-1 font-medium">Color Label</label>
                <div className="flex gap-3">
                    {['#6B8EAF', '#9A6BB5', '#C4943A', '#C45C3A', '#5CB870'].map(c => (
                        <div key={c} onClick={() => setDebtColor(c)} 
                             className={`w-8 h-8 rounded-full cursor-pointer transition-transform active:scale-95 ${debtColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'}`} 
                             style={{backgroundColor: c}} />
                    ))}
                </div>
              </div>
              <Button fullWidth onClick={addDebtAccount} className="mt-2">Add Debt</Button>
          </div>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Add Category">
          <div className="space-y-4">
              <Input 
                  label="Name"
                  value={catName} onChange={e => setCatName(e.target.value)} 
              />
              <Input 
                  label="Budget Limit"
                  type="number" inputMode="decimal"
                  value={catBudget} onChange={e => setCatBudget(e.target.value)} 
              />
              <Input 
                  label="Icon (Emoji)"
                  value={catIcon} onChange={e => setCatIcon(e.target.value)} 
              />
              <Button fullWidth onClick={addCategory} className="mt-2">Add Category</Button>
          </div>
      </Modal>

      {/* Subcategory Modal */}
      <Modal isOpen={showSubcatModal} onClose={() => setShowSubcatModal(false)} title="Manage Subcategories">
          <div className="space-y-4">
              {activeCategoryIndex !== null && data.budgetConfig.livingCategories[activeCategoryIndex] && (
                  <>
                      <h3 className="text-center font-bold text-accent">{data.budgetConfig.livingCategories[activeCategoryIndex].name}</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar bg-background/30 p-2 rounded-lg">
                          {data.budgetConfig.livingCategories[activeCategoryIndex].subcategories?.map((sub, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-card p-3 rounded-md border border-border/50">
                                  <span className="text-sm">{sub}</span>
                                  <button onClick={() => removeSubcategory(idx)} className="text-alert opacity-80 hover:opacity-100"><Trash2 size={14}/></button>
                              </div>
                          ))}
                          {(!data.budgetConfig.livingCategories[activeCategoryIndex].subcategories || data.budgetConfig.livingCategories[activeCategoryIndex].subcategories?.length === 0) && (
                              <p className="text-center text-xs text-textSecondary py-4">No subcategories yet.</p>
                          )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border/30">
                          <div className="flex-1">
                              <Input 
                                  placeholder="New Subcategory" 
                                  value={subcatInput} 
                                  onChange={e => setSubcatInput(e.target.value)} 
                              />
                          </div>
                          <Button onClick={addSubcategory} className="!w-[44px] !px-0 mt-0"><Plus size={18}/></Button>
                      </div>
                  </>
              )}
          </div>
      </Modal>

      {/* Recurring Rule Modal */}
      <Modal isOpen={showRecurringModal} onClose={() => setShowRecurringModal(false)} title="Add Recurring Rule">
          <div className="space-y-4">
              <Select 
                  label="Type"
                  value={recType} onChange={e => setRecType(e.target.value as any)}
              >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
              </Select>

              <Select 
                  label="Frequency"
                  value={recFrequency} onChange={e => setRecFrequency(e.target.value as any)}
              >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
              </Select>

              <Input 
                  label="Start Date (First Due)"
                  type="date"
                  value={recDate} onChange={e => setRecDate(e.target.value)}
              />

              <Input 
                  label="Amount"
                  type="number" inputMode="decimal"
                  value={recAmount} onChange={e => setRecAmount(e.target.value)}
              />

              <Input 
                  label="Note"
                  value={recNote} onChange={e => setRecNote(e.target.value)}
                  placeholder="e.g. Rent, Netflix..."
              />

              {/* Dynamic Fields */}
              {recType === 'expense' && (
                  <>
                    <Select label="Category" value={recCategory} onChange={e => setRecCategory(e.target.value)}>
                        {data.budgetConfig.livingCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        {data.budgetConfig.fixedObligations.map(c => <option key={c.name} value={c.name}>{c.name} (Fixed)</option>)}
                    </Select>
                    <Select label="Pay From" value={recSource} onChange={e => setRecSource(e.target.value)}>
                        <optgroup label="Bank">
                            {data.bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </optgroup>
                        <optgroup label="Credit">
                            {data.debtAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </optgroup>
                    </Select>
                  </>
              )}

              {recType === 'income' && (
                  <>
                    <Input label="Source Name" placeholder="e.g. Employer" value={recIncomeSource} onChange={e => setRecIncomeSource(e.target.value)} />
                    <Select label="Deposit To" value={recDest} onChange={e => setRecDest(e.target.value)}>
                        {data.bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        {data.debtAccounts.map(a => <option key={a.id} value={a.id}>{a.name} (Payoff)</option>)}
                    </Select>
                  </>
              )}

              {recType === 'transfer' && (
                  <>
                    <Select label="From Account" value={recSource} onChange={e => setRecSource(e.target.value)}>
                        {data.bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                    <Select label="To Account" value={recDest} onChange={e => setRecDest(e.target.value)}>
                        {data.bankAccounts.filter(a => a.id !== recSource).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        {data.debtAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                  </>
              )}

              <Button fullWidth onClick={addRecurring} className="mt-2">Create Rule</Button>
          </div>
      </Modal>

    </div>
  );
};