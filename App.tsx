import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { SetupWizard } from './components/SetupWizard';
import { HomePage } from './pages/Home';
import { MoneyPage } from './pages/Money';
import { FitnessPage } from './pages/Fitness';
import { NutritionPage } from './pages/Nutrition';
import { SettingsPage } from './pages/Settings';
import { AppData, Tab } from './types';
import { loadData, saveData } from './services/storageService';
import { INITIAL_APP_DATA } from './constants';
import { Command, Sparkles } from 'lucide-react';
import { initNotificationService } from './services/notificationService';
import { recordActivity } from './services/streakService';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_APP_DATA);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      // Reduced delay for faster entry while maintaining branding moment
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const stored = loadData();
      const processed = processRecurringTransactions(stored);
      setData(processed);
      if (processed !== stored) {
          saveData(processed);
      }
      setLoading(false);
      
      // Init Notifications
      initNotificationService();
    };
    init();
  }, []);

  // Recurring Transaction Processor
  const processRecurringTransactions = (currentData: AppData): AppData => {
    if (!currentData.recurringTransactions || currentData.recurringTransactions.length === 0) {
        return currentData;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today

    let hasChanges = false;
    let newRecurring = [...currentData.recurringTransactions];
    let newExpenses = [...currentData.expenses];
    let newIncomes = [...currentData.incomes];
    let newTransfers = [...currentData.transfers];
    let newBankAccounts = [...currentData.bankAccounts];
    let newDebtAccounts = [...currentData.debtAccounts];

    newRecurring = newRecurring.map(rule => {
        if (!rule.active) return rule;

        let dueDate = new Date(rule.nextDueDate);
        let processedCount = 0;
        let modifiedRule = { ...rule };

        // Process all due instances up to today
        while (dueDate <= today && processedCount < 12) { // Limit catch-up to 12 cycles safety
            hasChanges = true;
            processedCount++;
            const dateStr = dueDate.toISOString().split('T')[0];

            // 1. Create Transaction
            if (rule.type === 'expense') {
                newExpenses.unshift({
                    id: Math.random().toString(36).substr(2, 9),
                    date: dateStr,
                    categoryName: rule.categoryName || 'General',
                    amount: rule.amount,
                    note: rule.note + ' (Recurring)',
                    icon: '🔄',
                    sourceAccountId: rule.sourceAccountId || ''
                });

                // Update Balance
                const bankIdx = newBankAccounts.findIndex(b => b.id === rule.sourceAccountId);
                if (bankIdx >= 0) {
                    newBankAccounts[bankIdx] = { ...newBankAccounts[bankIdx], balance: newBankAccounts[bankIdx].balance - rule.amount };
                } else {
                    const debtIdx = newDebtAccounts.findIndex(d => d.id === rule.sourceAccountId);
                    if (debtIdx >= 0) {
                         newDebtAccounts[debtIdx] = { ...newDebtAccounts[debtIdx], currentBalance: newDebtAccounts[debtIdx].currentBalance + rule.amount };
                    }
                }

            } else if (rule.type === 'income') {
                newIncomes.unshift({
                    id: Math.random().toString(36).substr(2, 9),
                    date: dateStr,
                    source: rule.sourceName || 'Recurring Income',
                    amount: rule.amount,
                    accountId: rule.toAccountId || '',
                    note: rule.note
                });

                const bankIdx = newBankAccounts.findIndex(b => b.id === rule.toAccountId);
                if (bankIdx >= 0) {
                    newBankAccounts[bankIdx] = { ...newBankAccounts[bankIdx], balance: newBankAccounts[bankIdx].balance + rule.amount };
                } else {
                    const debtIdx = newDebtAccounts.findIndex(d => d.id === rule.toAccountId);
                    if (debtIdx >= 0) {
                         // Income to debt usually means paying it off
                         newDebtAccounts[debtIdx] = { ...newDebtAccounts[debtIdx], currentBalance: Math.max(0, newDebtAccounts[debtIdx].currentBalance - rule.amount) };
                    }
                }

            } else if (rule.type === 'transfer') {
                newTransfers.unshift({
                    id: Math.random().toString(36).substr(2, 9),
                    date: dateStr,
                    amount: rule.amount,
                    fromAccountId: rule.sourceAccountId || '',
                    toAccountId: rule.toAccountId || '',
                    note: rule.note + ' (Auto)'
                });

                // Deduct Source
                const srcBankIdx = newBankAccounts.findIndex(b => b.id === rule.sourceAccountId);
                if (srcBankIdx >= 0) {
                    newBankAccounts[srcBankIdx] = { ...newBankAccounts[srcBankIdx], balance: newBankAccounts[srcBankIdx].balance - rule.amount };
                } else {
                    const srcDebtIdx = newDebtAccounts.findIndex(d => d.id === rule.sourceAccountId);
                    if (srcDebtIdx >= 0) {
                        newDebtAccounts[srcDebtIdx] = { ...newDebtAccounts[srcDebtIdx], currentBalance: newDebtAccounts[srcDebtIdx].currentBalance + rule.amount };
                    }
                }

                // Add to Dest
                const destBankIdx = newBankAccounts.findIndex(b => b.id === rule.toAccountId);
                if (destBankIdx >= 0) {
                    newBankAccounts[destBankIdx] = { ...newBankAccounts[destBankIdx], balance: newBankAccounts[destBankIdx].balance + rule.amount };
                } else {
                    const destDebtIdx = newDebtAccounts.findIndex(d => d.id === rule.toAccountId);
                    if (destDebtIdx >= 0) {
                        newDebtAccounts[destDebtIdx] = { ...newDebtAccounts[destDebtIdx], currentBalance: Math.max(0, newDebtAccounts[destDebtIdx].currentBalance - rule.amount) };
                    }
                }
            }

            // 2. Calculate Next Due Date
            const nextDate = new Date(dueDate);
            if (rule.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
            if (rule.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
            if (rule.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            if (rule.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
            
            dueDate = nextDate;
            modifiedRule.nextDueDate = nextDate.toISOString().split('T')[0];
        }
        
        return modifiedRule;
    });

    if (!hasChanges) return currentData;

    return {
        ...currentData,
        recurringTransactions: newRecurring,
        expenses: newExpenses,
        incomes: newIncomes,
        transfers: newTransfers,
        bankAccounts: newBankAccounts,
        debtAccounts: newDebtAccounts
    };
  };

  // Update data wrapper
  const updateData = (newData: Partial<AppData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      saveData(updated);

      // Track streak when user logs meaningful data
      if (newData.meals || newData.expenses || newData.workouts || newData.incomes || newData.transfers) {
        recordActivity();
      }

      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Decorative background blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent rounded-full blur-[120px]" 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center"
        >
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="mb-8 p-8 rounded-[2.5rem] bg-card border border-border shadow-2xl shadow-accent/10 relative group"
            >
               <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-pulse-slow group-hover:bg-accent/30 transition-colors"></div>
               <Command size={56} className="text-accent relative z-10" />
               <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-ai"
               >
                 <Sparkles size={20} />
               </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ letterSpacing: "0.1em" }}
              animate={{ letterSpacing: "0.3em" }}
              className="text-4xl font-bold uppercase font-mono text-textPrimary mb-6"
            >
              Life Command
            </motion.h1>
            
            <div className="flex items-center gap-3 mb-8">
               {[0, 1, 2].map(i => (
                 <motion.div 
                   key={i}
                   animate={{ 
                     scale: [1, 1.5, 1],
                     backgroundColor: ["#2EA043", "#5CB870", "#2EA043"] 
                   }}
                   transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                   className="w-2 h-2 rounded-full" 
                 />
               ))}
            </div>
            
            <motion.p 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] text-textSecondary font-mono uppercase tracking-[0.4em]"
            >
              System Initializing
            </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show Setup Wizard if not initialized
  if (!data.initialized) {
    return <SetupWizard onComplete={updateData} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} userProfile={data.userProfile}>
      {activeTab === Tab.HOME && (
        <HomePage data={data} onNavigate={setActiveTab} />
      )}
      {activeTab === Tab.MONEY && (
        <MoneyPage data={data} updateData={updateData} />
      )}
      {activeTab === Tab.FITNESS && (
        <FitnessPage data={data} updateData={updateData} />
      )}
      {activeTab === Tab.NUTRITION && (
        <NutritionPage data={data} updateData={updateData} />
      )}
      {activeTab === Tab.SETTINGS && (
        <SettingsPage data={data} updateData={updateData} onBack={() => setActiveTab(Tab.HOME)} />
      )}
    </Layout>
  );
};

export default App;