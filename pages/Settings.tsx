
import React, { useState, useEffect } from 'react';
import { AppData, BankAccount, BudgetCategory, DebtAccount, RecurringTransaction, UserProfile } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { exportData, importData } from '../services/storageService';
import { getHealthImport, saveHealthImport, clearHealthImport } from '../services/healthImportService';
import { isAiReady, getAiUsage, UsageStats } from '../services/geminiService';
import { requestNotificationPermission, getNotificationPermissionStatus, sendNotification } from '../services/notificationService';
import { 
  Download, Upload, Plus, Trash2, List, 
  ChevronRight, ArrowLeft, Wallet, Activity, Database, 
  Utensils, Moon, Target, CreditCard, Landmark, RefreshCw, Sparkles, CheckCircle2, AlertCircle, Bell, HeartPulse, UserCircle,
  Lock, Unlock, Edit2, Info, Settings as SettingsIcon, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsProps {
  data: AppData;
  updateData: (data: Partial<AppData>) => void;
  onBack: () => void;
}

type SettingsSection = 'MAIN' | 'PROFILE' | 'MONEY' | 'HEALTH' | 'SYSTEM';

export const SettingsPage: React.FC<SettingsProps> = ({ data, updateData, onBack }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('MAIN');
  const [aiConnected, setAiConnected] = useState(isAiReady());
  const [aiUsage, setAiUsage] = useState<UsageStats | null>(null);
  const [notifStatus, setNotifStatus] = useState(getNotificationPermissionStatus());

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
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [subcatInput, setSubcatInput] = useState('');

  // Recurring Form
  const [recType, setRecType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [recFrequency, setRecFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [recAmount, setRecAmount] = useState('');
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [recNote, setRecNote] = useState('');
  
  const [recCategory, setRecCategory] = useState(data.budgetConfig.livingCategories[0]?.name || '');
  const [recSource, setRecSource] = useState(data.bankAccounts[0]?.id || '');
  const [recDest, setRecDest] = useState(data.bankAccounts[0]?.id || '');
  const [recIncomeSource, setRecIncomeSource] = useState('');

  // API Key Input
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Health Import State
  const [healthJsonText, setHealthJsonText] = useState('');
  const [healthDataInfo, setHealthDataInfo] = useState<string | null>(null);

  useEffect(() => {
    setAiConnected(isAiReady());
    setAiUsage(getAiUsage());
    const existingHealth = getHealthImport();
    if (existingHealth && existingHealth.exportDate) {
        setHealthDataInfo(`Last import: ${existingHealth.exportDate} • ${existingHealth.totalDays} days of data`);
    } else {
        setHealthDataInfo('No health data imported.');
    }
    
    // Refresh Key Input when opening settings
    setApiKeyInput(localStorage.getItem('gemini_api_key') || '');
  }, [activeSection]);

  // --- Handlers ---
  
  const saveApiKey = () => {
    if (apiKeyInput.length > 0 && apiKeyInput.length < 10) {
      alert("Invalid API Key");
      return;
    }
    
    if (apiKeyInput.length === 0) {
      localStorage.removeItem('gemini_api_key');
    } else {
      localStorage.setItem('gemini_api_key', apiKeyInput);
    }
    
    alert('API Key configuration updated!');
    window.location.reload();
  };

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

  const processHealthJson = (jsonString: string) => {
      const sanitized = jsonString
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2018\u2019]/g, "'");

      let parsed;
      try {
          parsed = JSON.parse(sanitized);
      } catch (e) {
          alert('Invalid JSON: Parsing failed. Please ensure the data is valid JSON format.');
          return;
      }

      if (parsed && parsed.exportDate && Array.isArray(parsed.days)) {
          try {
              saveHealthImport(parsed);
              alert(`Success! Imported ${parsed.totalDays} days of health data.`);
              setHealthJsonText('');
              window.location.reload();
          } catch (e: any) {
              alert(`Import Failed: ${e.message || 'Unknown storage error'}`);
          }
      } else {
          alert('Invalid Data Structure: JSON must contain "exportDate" and a "days" array.');
      }
  };

  const handlePasteHealthImport = () => {
      if (!healthJsonText.trim()) {
          alert('Please paste JSON data first.');
          return;
      }
      setTimeout(() => processHealthJson(healthJsonText), 10);
  };

  const handleHealthFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const text = await file.text();
          processHealthJson(text);
      } catch (e) {
          alert("Failed to read file.");
      }
      e.target.value = '';
  };

  const handleClearHealth = () => {
      if (confirm('Are you sure you want to clear all imported health data?')) {
          clearHealthImport();
          window.location.reload();
      }
  };

  const updateGoal = (key: keyof typeof data.fitnessGoals, value: string) => {
      updateData({
          fitnessGoals: {
              ...data.fitnessGoals,
              [key]: parseFloat(value) || 0
          }
      });
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    updateData({
      userProfile: {
        ...data.userProfile,
        [key]: value
      }
    });
  };

  const enableNotifications = async () => {
      const granted = await requestNotificationPermission();
      setNotifStatus(getNotificationPermissionStatus());
      if (granted) {
          alert("Notifications enabled! Reminders active at 9AM, 1PM, and 8PM.");
          sendNotification("System Active", "Life Command notifications are now operational.");
      } else {
          alert("Permission denied. Check browser settings.");
      }
  };

  const testNotification = () => {
      sendNotification("Test Notification", "This is a test of the Life Command notification system.");
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

  const saveCategory = () => {
      if (!catName) return;
      const amount = parseFloat(catBudget) || 0;
      
      if (editingCategoryIndex !== null) {
          // Edit existing
          const updatedCats = [...data.budgetConfig.livingCategories];
          const oldName = updatedCats[editingCategoryIndex].name;
          
          updatedCats[editingCategoryIndex] = {
              ...updatedCats[editingCategoryIndex],
              name: catName,
              budget: amount,
              icon: catIcon
          };

          const updates: Partial<AppData> = {
              budgetConfig: {
                  ...data.budgetConfig,
                  livingCategories: updatedCats
              }
          };

          // If name changed, update associated expenses and recurring transactions
          if (oldName !== catName) {
              updates.expenses = data.expenses.map(e => 
                  e.categoryName === oldName ? { ...e, categoryName: catName } : e
              );
              updates.recurringTransactions = data.recurringTransactions.map(r => 
                  r.categoryName === oldName ? { ...r, categoryName: catName } : r
              );
          }

          updateData(updates);
      } else {
          // Add new
          const newCat: BudgetCategory = {
              name: catName,
              budget: amount,
              icon: catIcon,
              subcategories: [],
              locked: false
          };
          updateData({
              budgetConfig: {
                  ...data.budgetConfig,
                  livingCategories: [...data.budgetConfig.livingCategories, newCat]
              }
          });
      }
      
      setCatName(''); 
      setCatBudget(''); 
      setCatIcon('💸');
      setEditingCategoryIndex(null);
      setShowCatModal(false);
  };

  const openEditCategory = (idx: number) => {
      const cat = data.budgetConfig.livingCategories[idx];
      setCatName(cat.name);
      setCatBudget(cat.budget?.toString() || '');
      setCatIcon(cat.icon);
      setEditingCategoryIndex(idx);
      setShowCatModal(true);
  };

  const openAddCategory = () => {
      setCatName('');
      setCatBudget('');
      setCatIcon('💸');
      setEditingCategoryIndex(null);
      setShowCatModal(true);
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

  const toggleCategoryLock = (idx: number) => {
      const updated = [...data.budgetConfig.livingCategories];
      updated[idx] = { ...updated[idx], locked: !updated[idx].locked };
      updateData({
          budgetConfig: { ...data.budgetConfig, livingCategories: updated }
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
      updateData({ budgetConfig: { ...data.budgetConfig, livingCategories: cats } });
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
      updateData({ budgetConfig: { ...data.budgetConfig, livingCategories: cats } });
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
          ...(recType === 'expense' && { categoryName: recCategory, sourceAccountId: recSource }),
          ...(recType === 'income' && { sourceName: recIncomeSource, toAccountId: recDest }),
          ...(recType === 'transfer' && { sourceAccountId: recSource, toAccountId: recDest })
      };
      updateData({ recurringTransactions: [...(data.recurringTransactions || []), newRule] });
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

  // --- Sub-Components ---

  const MenuButton = ({ icon: Icon, label, onClick, subtext, alert }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-border/30 transition-all active:scale-[0.98] group mb-3"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg transition-colors ${alert ? 'bg-alert/10 text-alert' : 'bg-background text-accent group-hover:text-white'}`}>
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

  // --- Views ---

  const renderMainMenu = () => (
    <div className="space-y-1 animate-slide-up">
       <div className="mb-6 px-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
          <p className="text-sm text-textSecondary">Manage your preferences</p>
       </div>

       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
           <MenuButton 
              icon={UserCircle} 
              label="Personal Profile" 
              subtext="Name, Currency, Schedule"
              onClick={() => setActiveSection('PROFILE')} 
           />
       </motion.div>
       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
           <MenuButton 
              icon={Wallet} 
              label="Money & Assets" 
              subtext="Banks, Debts, Recurring"
              onClick={() => setActiveSection('MONEY')} 
           />
       </motion.div>
       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
           <MenuButton 
              icon={Activity} 
              label="Health & Fitness" 
              subtext="Macros, Targets, Import"
              onClick={() => setActiveSection('HEALTH')} 
           />
       </motion.div>
       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
           <MenuButton 
              icon={Database} 
              label="System & AI" 
              subtext={
                <div className="flex items-center gap-2">
                    <span>API Status, Backup, Reset</span>
                    {notifStatus === 'granted' && <Bell size={10} className="text-accent" />}
                </div>
              }
              onClick={() => setActiveSection('SYSTEM')} 
           />
       </motion.div>

       {/* AI Usage Indicator */}
       {aiUsage && aiConnected && (
         <div className="mt-6 p-4 bg-card border border-border rounded-xl">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] text-textSecondary font-mono uppercase tracking-widest">Gemini API Usage</span>
               <div className="flex items-center gap-2">
                 {aiUsage.isRateLimited && <span className="text-[10px] font-bold text-alert animate-pulse">RATE LIMITED</span>}
                 <span className="text-[10px] font-mono font-bold text-accent">{aiUsage.quotaLimit - aiUsage.todayCount} remaining today</span>
               </div>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ${aiUsage.isRateLimited ? 'bg-alert' : 'bg-accent'}`} 
                 style={{ width: `${Math.min(100, (aiUsage.todayCount / aiUsage.quotaLimit) * 100)}%` }}
               />
            </div>
            {aiUsage.isRateLimited && (
              <p className="text-[10px] text-alert mt-2 text-center bg-alert/10 py-1 rounded">
                API busy. Try again in {aiUsage.retryAfterSeconds}s or wait a minute.
              </p>
            )}
            <p className="text-[10px] text-textMuted mt-2 text-center">Standard Free Tier: {aiUsage.quotaLimit} requests/day</p>
         </div>
       )}

       <div className="pt-8 text-center">
          <p className="text-[10px] text-textSecondary font-mono uppercase tracking-widest opacity-40">System Core v2.5.4</p>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6 animate-slide-up">
      <Card title="IDENTITY">
         <div className="space-y-4">
            <Input 
              label="Display Name" 
              value={data.userProfile.name} 
              onChange={e => updateProfile('name', e.target.value)} 
            />
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Currency Symbol" 
                value={data.userProfile.currency} 
                onChange={e => updateProfile('currency', e.target.value)}
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="AED">AED (AED)</option>
                <option value="¥">JPY (¥)</option>
              </Select>
              <Select 
                label="Payday" 
                value={data.userProfile.payday.toString()} 
                onChange={e => updateProfile('payday', parseInt(e.target.value))}
              >
                 {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
         </div>
      </Card>

      <Card title="WORK SCHEDULE">
         <div className="grid grid-cols-2 gap-4">
            <Input label="Mon-Thu" value={data.userProfile.workSchedule.regular} onChange={e => updateProfile('workSchedule', {...data.userProfile.workSchedule, regular: e.target.value})} />
            <Input label="Friday" value={data.userProfile.workSchedule.friday} onChange={e => updateProfile('workSchedule', {...data.userProfile.workSchedule, friday: e.target.value})} />
         </div>
         <p className="text-[10px] text-textMuted mt-3">Used for habit reminders and productivity insights.</p>
      </Card>
    </div>
  );

  const renderMoneySettings = () => (
    <div className="space-y-6 animate-slide-up pb-20">
      <Card title="BANK ACCOUNTS" action={<button onClick={() => setShowBankModal(true)} className="text-accent p-1 bg-background border border-border rounded transition-transform active:scale-90"><Plus size={16} /></button>}>
          <div className="space-y-2">
              {data.bankAccounts.map((acc, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                          <Landmark size={16} className="text-textSecondary" />
                          <span className="text-sm font-medium">{acc.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-textPrimary">{data.userProfile.currency}{acc.balance.toLocaleString()}</span>
                          <button onClick={() => confirmRemoveBank(idx)} className="text-textSecondary hover:text-alert p-2"><Trash2 size={14}/></button>
                      </div>
                  </div>
              ))}
              {data.bankAccounts.length === 0 && <p className="text-center text-xs text-textMuted py-4">No accounts added yet.</p>}
          </div>
      </Card>

      <Card title="DEBT ACCOUNTS" action={<button onClick={() => setShowDebtModal(true)} className="text-accent p-1 bg-background border border-border rounded transition-transform active:scale-90"><Plus size={16} /></button>}>
          <div className="space-y-2">
              {data.debtAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                          <CreditCard size={16} style={{color: acc.color}} />
                          <span className="text-sm font-bold" style={{color: acc.color}}>{acc.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="font-mono text-sm text-alert">{data.userProfile.currency}{acc.currentBalance.toLocaleString()}</span>
                         <button onClick={() => confirmRemoveDebt(acc.id)} className="text-textSecondary hover:text-alert p-2"><Trash2 size={14}/></button>
                      </div>
                  </div>
              ))}
              {data.debtAccounts.length === 0 && <p className="text-center text-xs text-textMuted py-4">Debt free! Good job.</p>}
          </div>
      </Card>

      <Card title="RECURRING RULES" action={<button onClick={() => setShowRecurringModal(true)} className="text-accent p-1 bg-background border border-border rounded transition-transform active:scale-90"><Plus size={16} /></button>}>
          <div className="space-y-2">
              {data.recurringTransactions?.map((rule) => (
                  <div key={rule.id} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${rule.type === 'income' ? 'bg-accent/10 text-accent' : rule.type === 'transfer' ? 'bg-info/10 text-info' : 'bg-alert/10 text-alert'}`}>
                            <RefreshCw size={14} />
                          </div>
                          <div>
                              <p className="text-sm font-bold text-textPrimary capitalize">{rule.note || rule.type}</p>
                              <p className="text-[10px] text-textSecondary capitalize">{rule.frequency} • {data.userProfile.currency}{rule.amount}</p>
                          </div>
                      </div>
                      <button onClick={() => confirmRemoveRecurring(rule.id)} className="text-textSecondary hover:text-alert p-2"><Trash2 size={14}/></button>
                  </div>
              ))}
              {(!data.recurringTransactions || data.recurringTransactions.length === 0) && <p className="text-center text-xs text-textMuted py-4">No recurring transactions.</p>}
          </div>
      </Card>

      <Card title="BUDGET CATEGORIES" action={<button onClick={openAddCategory} className="text-accent p-1 bg-background border border-border rounded transition-transform active:scale-90"><Plus size={16} /></button>}>
          <p className="text-[10px] text-textSecondary mb-2">Locked categories are protected from rebalancing when you overspend elsewhere.</p>
          <div className="grid grid-cols-2 gap-2">
              {data.budgetConfig.livingCategories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/40 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-base shrink-0">{cat.icon}</span>
                          <span className="text-[11px] font-medium truncate">{cat.name}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                          <button onClick={() => toggleCategoryLock(idx)} className={`p-1.5 hover:text-white rounded transition-colors ${cat.locked ? 'text-accent' : 'text-textSecondary'}`}>
                             {cat.locked ? <Lock size={12}/> : <Unlock size={12}/>}
                          </button>
                          <button onClick={() => openEditCategory(idx)} className="text-textSecondary hover:text-white p-1.5"><Edit2 size={12}/></button>
                          <button onClick={() => openSubcatModal(idx)} className="text-textSecondary hover:text-white p-1.5"><List size={12}/></button>
                          <button onClick={() => confirmRemoveCategory(idx)} className="text-textSecondary hover:text-alert p-1.5"><Trash2 size={12}/></button>
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
          <div className="grid grid-cols-2 gap-4">
              <Input label="Calories" type="number" inputMode="numeric" value={data.fitnessGoals.calorieGoal} onChange={e => updateGoal('calorieGoal', e.target.value)} />
              <Input label="Protein (g)" type="number" inputMode="numeric" value={data.fitnessGoals.proteinGoal} onChange={e => updateGoal('proteinGoal', e.target.value)} />
              <Input label="Carbs (g)" type="number" inputMode="numeric" value={data.fitnessGoals.carbGoal} onChange={e => updateGoal('carbGoal', e.target.value)} />
              <Input label="Fats (g)" type="number" inputMode="numeric" value={data.fitnessGoals.fatGoal} onChange={e => updateGoal('fatGoal', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="Fiber (g)" type="number" inputMode="numeric" value={data.fitnessGoals.fiberGoal} onChange={e => updateGoal('fiberGoal', e.target.value)} />
              <Input label="Sugar (g)" type="number" inputMode="numeric" value={data.fitnessGoals.sugarLimit} onChange={e => updateGoal('sugarLimit', e.target.value)} />
          </div>
      </Card>

      <Card title="ACTIVITY GOALS">
          <div className="grid grid-cols-2 gap-4">
              <Input label="Weekly Training" type="number" value={data.fitnessGoals.weeklySessionTarget} onChange={e => updateGoal('weeklySessionTarget', e.target.value)} />
              <Input label="Sleep (hrs)" type="number" value={data.fitnessGoals.sleepGoal} onChange={e => updateGoal('sleepGoal', e.target.value)} />
              <Input label="Daily Steps" type="number" value={data.fitnessGoals.stepGoal} onChange={e => updateGoal('stepGoal', e.target.value)} />
              <Input label="Move (kcal)" type="number" value={data.fitnessGoals.moveGoal} onChange={e => updateGoal('moveGoal', e.target.value)} />
          </div>
      </Card>

      <Card title="HEALTH DATA IMPORT" action={<HeartPulse size={16} className="text-alert"/>}>
          <p className="text-[10px] text-accent font-mono mb-2">{healthDataInfo}</p>
          <p className="text-[10px] text-textSecondary mb-3">Paste your pre-processed health JSON here to sync steps, sleep, and activity history.</p>
          <textarea 
            className="w-full bg-background/50 border border-border rounded-lg p-3 text-[10px] font-mono h-24 mb-3 focus:ring-2 focus:ring-accent/50 outline-none"
            placeholder='{ "exportDate": "...", "days": [...] }'
            value={healthJsonText}
            onChange={e => setHealthJsonText(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button fullWidth onClick={handlePasteHealthImport}>SYNC JSON</Button>
            <div className="relative">
                <Button variant="secondary" fullWidth>UPLOAD FILE</Button>
                <input type="file" accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleHealthFileImport} />
            </div>
          </div>
          <Button variant="ghost" fullWidth onClick={handleClearHealth} className="text-alert mt-2 text-[11px] h-8 min-h-0">CLEAR HISTORY</Button>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6 animate-slide-up pb-20">
      <Card title="AI ENGINE CONFIG">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className={aiConnected ? 'text-accent' : 'text-alert'} />
              <span className="text-xs font-bold uppercase tracking-tight">Status: {aiConnected ? 'Operational' : 'API Key Missing'}</span>
            </div>
            {aiConnected && <CheckCircle2 size={16} className="text-accent" />}
          </div>
          <div className="space-y-3">
              <Input 
                  label="API Key (Optional)"
                  type="password"
                  placeholder="Paste key to override system default"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
              />
              <Button fullWidth onClick={saveApiKey}>UPDATE CONFIGURATION</Button>
              <p className="text-[10px] text-textSecondary">
                 Leave empty to use the built-in system key ({process.env.API_KEY ? 'Present' : 'Missing'}).
              </p>
          </div>
      </Card>

      <Card title="SYSTEM NOTIFICATIONS">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${notifStatus === 'granted' ? 'bg-accent/10 text-accent' : 'bg-alert/10 text-alert'}`}>
                      <Bell size={18} />
                  </div>
                  <div>
                      <p className="text-xs font-bold uppercase tracking-tight">
                          Status: {notifStatus === 'granted' ? 'Active' : notifStatus === 'denied' ? 'Blocked' : 'Inactive'}
                      </p>
                      <p className="text-[10px] text-textSecondary">
                          {notifStatus === 'granted' ? '3x daily reminders active' : 'Permission required for reminders'}
                      </p>
                  </div>
              </div>
              {notifStatus === 'granted' && <ShieldCheck size={16} className="text-accent" />}
          </div>
          
          <div className="space-y-3">
              {notifStatus !== 'granted' ? (
                  <Button variant="secondary" fullWidth onClick={enableNotifications}>
                      <Bell size={16} className="mr-2" /> ENABLE NOTIFICATIONS
                  </Button>
              ) : (
                  <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" fullWidth onClick={testNotification}>
                          TEST PUSH
                      </Button>
                      <Button variant="ghost" fullWidth onClick={enableNotifications} className="text-textSecondary border-border/50">
                          RE-REQUEST
                      </Button>
                  </div>
              )}
              
              <div className="bg-background/50 p-3 rounded-xl border border-border/50">
                  <div className="flex items-start gap-2">
                      <Info size={14} className="text-info shrink-0 mt-0.5" />
                      <p className="text-[10px] text-textSecondary leading-relaxed">
                          Reminders are sent at 09:00, 13:00, and 20:00. Ensure your browser allows notifications for this site. 
                          If "Blocked", you must reset permissions in your browser's site settings.
                      </p>
                  </div>
              </div>
          </div>
      </Card>

      <Card title="LOCAL STORAGE MANAGEMENT">
          <p className="text-[10px] text-textSecondary mb-4 leading-relaxed">All data is stored exclusively in your browser. Export frequently to prevent data loss or to sync across devices.</p>
          <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" fullWidth onClick={() => exportData(data, 'file')}>
                  <Download size={16} className="mr-2" /> EXPORT ALL
              </Button>
              <Button variant="ghost" fullWidth onClick={handleImport}>
                  <Upload size={16} className="mr-2" /> RESTORE
              </Button>
          </div>
          <Button variant="danger" fullWidth onClick={() => {
              if (confirm('Delete all app data? This cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
          }} className="mt-4 text-[11px] h-10 min-h-0">
              PURGE LOCAL DATABASE
          </Button>
      </Card>
    </div>
  );

  // Consolidate header logic to fix TypeScript comparison error on activeSection === 'MAIN'
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
         {activeSection !== 'MAIN' && (
             <>
                 <button onClick={() => setActiveSection('MAIN')} className="mr-3 p-2 hover:bg-card rounded-full transition-colors text-textSecondary active:scale-90">
                     <ArrowLeft size={20} />
                 </button>
                 <h2 className="text-lg font-bold text-textPrimary capitalize">
                     {activeSection === 'PROFILE' ? 'Personal Profile' :
                      activeSection === 'MONEY' ? 'Money Management' :
                      activeSection === 'HEALTH' ? 'Health & Fitness' : 'System & AI'}
                 </h2>
             </>
         )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeSection === 'MAIN' && renderMainMenu()}
          {activeSection === 'PROFILE' && renderProfileSettings()}
          {activeSection === 'MONEY' && renderMoneySettings()}
          {activeSection === 'HEALTH' && renderHealthSettings()}
          {activeSection === 'SYSTEM' && renderSystemSettings()}
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen} 
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
      />

      {/* Shared Modals for Data Entry */}
      <Modal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="Add Bank Account">
          <div className="space-y-4">
              <Input label="Account Name" placeholder="e.g. Primary Savings" value={bankName} onChange={e => setBankName(e.target.value)} />
              <Input label="Starting Balance" type="number" inputMode="decimal" placeholder="0.00" value={bankBalance} onChange={e => setBankBalance(e.target.value)} />
              <Button fullWidth onClick={addBankAccount} className="mt-2">CREATE ACCOUNT</Button>
          </div>
      </Modal>

      <Modal isOpen={showDebtModal} onClose={() => setShowDebtModal(false)} title="Add Debt/Credit Card">
          <div className="space-y-4">
              <Input label="Provider Name" placeholder="e.g. Amex Platinum" value={debtName} onChange={e => setDebtName(e.target.value)} />
              <Input label="Current Balance" type="number" inputMode="decimal" value={debtBalance} onChange={e => setDebtBalance(e.target.value)} />
              <Input label="Starting Limit" type="number" inputMode="decimal" value={debtStart} onChange={e => setDebtStart(e.target.value)} />
              <div>
                <label className="block text-xs text-textSecondary mb-2 font-medium">Category Color</label>
                <div className="flex justify-between">
                    {['#F85149', '#D29922', '#58A6FF', '#A371F7', '#5CB870', '#8B949E'].map(c => (
                        <div key={c} onClick={() => setDebtColor(c)} className={`w-10 h-10 rounded-full cursor-pointer transition-all active:scale-90 ${debtColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : 'opacity-40 hover:opacity-100'}`} style={{backgroundColor: c}} />
                    ))}
                </div>
              </div>
              <Button fullWidth onClick={addDebtAccount} className="mt-2">ADD DEBT</Button>
          </div>
      </Modal>

      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title={editingCategoryIndex !== null ? "Edit Category" : "Add Spending Category"}>
          <div className="space-y-4">
              <Input label="Category Name" placeholder="e.g. Subscriptions" value={catName} onChange={e => setCatName(e.target.value)} />
              <Input label="Monthly Budget" type="number" inputMode="decimal" value={catBudget} onChange={e => setCatBudget(e.target.value)} />
              <Input label="Emoji Icon" placeholder="💰" value={catIcon} onChange={e => setCatIcon(e.target.value)} />
              <Button fullWidth onClick={saveCategory} className="mt-2">{editingCategoryIndex !== null ? "UPDATE CATEGORY" : "CREATE CATEGORY"}</Button>
          </div>
      </Modal>

      <Modal isOpen={showSubcatModal} onClose={() => setShowSubcatModal(false)} title="Manage Subcategories">
          <div className="space-y-4">
              {activeCategoryIndex !== null && (
                  <>
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar bg-background/30 p-2 rounded-lg">
                          {data.budgetConfig.livingCategories[activeCategoryIndex].subcategories?.map((sub, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-card p-3 rounded-xl border border-border/50 shadow-sm animate-fade-in">
                                  <span className="text-xs font-bold">{sub}</span>
                                  <button onClick={() => removeSubcategory(idx)} className="text-alert p-1 hover:bg-alert/10 rounded transition-colors"><Trash2 size={14}/></button>
                              </div>
                          ))}
                          {(!data.budgetConfig.livingCategories[activeCategoryIndex].subcategories || data.budgetConfig.livingCategories[activeCategoryIndex].subcategories.length === 0) && (
                            <p className="text-center text-[10px] text-textMuted py-4">No subcategories defined.</p>
                          )}
                      </div>
                      <div className="flex gap-2">
                          <Input placeholder="Add sub..." value={subcatInput} onChange={e => setSubcatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubcategory()} />
                          <Button onClick={addSubcategory} className="px-3 shrink-0 h-[44px]"><Plus size={18}/></Button>
                      </div>
                  </>
              )}
          </div>
      </Modal>

      <Modal isOpen={showRecurringModal} onClose={() => setShowRecurringModal(false)} title="Create Recurring Rule">
          <div className="space-y-4">
              <Select label="Transaction Type" value={recType} onChange={e => setRecType(e.target.value as any)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Frequency" value={recFrequency} onChange={e => setRecFrequency(e.target.value as any)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </Select>
                <Input label="Next Due" type="date" value={recDate} onChange={e => setRecDate(e.target.value)} />
              </div>
              <Input label="Amount" type="number" inputMode="decimal" placeholder="0.00" value={recAmount} onChange={e => setRecAmount(e.target.value)} />
              <Input label="Description" placeholder="e.g. Rent Payment" value={recNote} onChange={e => setRecNote(e.target.value)} />
              <Button fullWidth onClick={addRecurring} className="mt-2">ACTIVATE RULE</Button>
          </div>
      </Modal>
    </div>
  );
};
