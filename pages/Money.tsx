
import React, { useState, useEffect } from 'react';
import { AppData, BankAccount, DebtAccount, Expense, Income, Transfer, BudgetCategory } from '../types';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { exportData } from '../services/storageService';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, DollarSign, X, ArrowRightLeft, Download, Shield, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

interface MoneyProps {
  data: AppData;
  updateData: (data: Partial<AppData>) => void;
}

interface Split {
  amount: string;
  category: string;
  counterPartyId?: string; // For transfers
  note: string;
}

export const MoneyPage: React.FC<MoneyProps> = ({ data, updateData }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  
  // Rebalance State
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<Expense | null>(null);
  const [rebalanceDeficit, setRebalanceDeficit] = useState(0);
  const [rebalanceMap, setRebalanceMap] = useState<Record<string, number>>({});
  
  // Confirmation State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Payment Form State
  const [selectedCardId, setSelectedCardId] = useState(data.debtAccounts[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense Form State
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(data.budgetConfig.livingCategories[0]?.name || '');
  const [expenseSubcategory, setExpenseSubcategory] = useState('');
  const [expenseSource, setExpenseSource] = useState(data.bankAccounts[0]?.id || '');
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Value State
  const [editTitle, setEditTitle] = useState('');
  const [editValue, setEditValue] = useState('');
  const [pendingAccountEdit, setPendingAccountEdit] = useState<{
    id: string;
    type: 'bank' | 'debt';
    oldValue: number;
    newValue: number;
    name: string;
  } | null>(null);

  // Reconciliation State
  const [reconcileSplits, setReconcileSplits] = useState<Split[]>([]);

  // Net Worth Logic
  const totalAssets = data.bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const totalDebt = data.debtAccounts.reduce((sum, d) => sum + d.currentBalance, 0);
  const netWorth = totalAssets - totalDebt;

  // Budget Cycle Logic
  const today = new Date();
  const payday = data.budgetConfig.cycleStartDay;
  let cycleStart = new Date(today.getFullYear(), today.getMonth(), payday);
  if (today.getDate() < payday) {
    cycleStart = new Date(today.getFullYear(), today.getMonth() - 1, payday);
  }
  const cycleStartStr = cycleStart.toISOString().split('T')[0];

  const incomeCategories = ["Salary", "Refund", "Sale", "Gift", "Adjustment"];

  // Update subcategories when category changes
  useEffect(() => {
    const category = data.budgetConfig.livingCategories.find(c => c.name === expenseCategory);
    const subs = category?.subcategories || [];
    setAvailableSubcategories(subs);
    setExpenseSubcategory(subs.length > 0 ? subs[0] : '');
  }, [expenseCategory, data.budgetConfig.livingCategories]);

  // Ensure default source is valid when modal opens
  useEffect(() => {
      if (showExpenseModal && !expenseSource) {
          // If asset mode is on, ensure we pick a bank account
          if (data.assetOnlyMode) {
              if (data.bankAccounts.length > 0) setExpenseSource(data.bankAccounts[0].id);
          } else {
              if (data.bankAccounts.length > 0) setExpenseSource(data.bankAccounts[0].id);
              else if (data.debtAccounts.length > 0) setExpenseSource(data.debtAccounts[0].id);
          }
      }
  }, [showExpenseModal, data.bankAccounts, data.debtAccounts, data.assetOnlyMode]);

  const toggleAssetMode = () => {
    updateData({ assetOnlyMode: !data.assetOnlyMode });
  };

  // Helpers defined before usage to ensure type safety in dependent functions
  const getCategorySpend = (catName: string): number => {
      return data.expenses
        .filter(e => e.categoryName === catName && e.date >= cycleStartStr)
        .reduce((sum: number, e) => sum + e.amount, 0);
  };

  const getCategoryColor = (spent: number, budget: number) => {
      const pct = (spent / budget) * 100;
      if (pct < 50) return '#5CB870';
      if (pct < 80) return '#D29922';
      if (pct < 100) return '#F85149';
      return '#8B0000';
  };

  const handleLogPayment = () => {
    if (!paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    
    const newPayment = {
        date: paymentDate,
        cardId: selectedCardId,
        amount: amount
    };
    
    const updatedAccounts = data.debtAccounts.map(acc => {
        if (acc.id === selectedCardId) {
            return { ...acc, currentBalance: Math.max(0, acc.currentBalance - amount) };
        }
        return acc;
    });

    updateData({
        debtAccounts: updatedAccounts,
        debtPaymentHistory: [...data.debtPaymentHistory, newPayment]
    });

    setShowPaymentModal(false);
    setPaymentAmount('');
  };

  const checkBudgetAndAddExpense = () => {
      if (!expenseAmount) return;
      const amount = parseFloat(expenseAmount);
      const category = data.budgetConfig.livingCategories.find(c => c.name === expenseCategory);
      
      const newExpense: Expense = {
          id: Math.random().toString(36).substr(2, 9),
          date: expenseDate,
          categoryName: expenseCategory,
          subcategoryName: expenseSubcategory,
          amount: amount,
          note: expenseNote,
          icon: category?.icon || '💸',
          sourceAccountId: expenseSource
      };

      // Check Budget Overrun
      const currentSpend = getCategorySpend(expenseCategory);
      const newSpend = currentSpend + amount;
      const budget = category?.budget || 0;

      if (budget > 0 && newSpend > budget) {
          setPendingExpense(newExpense);
          setRebalanceDeficit(newSpend - budget);
          setRebalanceMap({});
          setShowExpenseModal(false);
          setShowRebalanceModal(true);
      } else {
          processExpense(newExpense);
          setShowExpenseModal(false);
      }

      setExpenseAmount('');
      setExpenseNote('');
  };

  const processExpense = (expense: Expense, budgetAdjustments?: BudgetCategory[]) => {
      let updatedBankAccounts = data.bankAccounts;
      let updatedDebtAccounts = data.debtAccounts;

      const bankIndex = data.bankAccounts.findIndex(b => b.id === expense.sourceAccountId);
      if (bankIndex !== -1) {
          updatedBankAccounts = [...data.bankAccounts];
          updatedBankAccounts[bankIndex] = {
              ...updatedBankAccounts[bankIndex],
              balance: updatedBankAccounts[bankIndex].balance - expense.amount
          };
      } else {
          const debtIndex = data.debtAccounts.findIndex(d => d.id === expense.sourceAccountId);
          if (debtIndex !== -1) {
              updatedDebtAccounts = [...data.debtAccounts];
              updatedDebtAccounts[debtIndex] = {
                  ...updatedDebtAccounts[debtIndex],
                  currentBalance: updatedDebtAccounts[debtIndex].currentBalance + expense.amount
              };
          }
      }

      const updatePayload: Partial<AppData> = {
          expenses: [expense, ...data.expenses],
          bankAccounts: updatedBankAccounts,
          debtAccounts: updatedDebtAccounts
      };

      if (budgetAdjustments) {
          updatePayload.budgetConfig = {
              ...data.budgetConfig,
              livingCategories: budgetAdjustments
          };
      }

      updateData(updatePayload);
  };

  const handleRebalanceConfirm = () => {
      if (!pendingExpense) return;
      
      const updatedCategories = data.budgetConfig.livingCategories.map(cat => {
          const pullAmount = rebalanceMap[cat.name] || 0;
          if (pullAmount > 0) {
              return { 
                  ...cat, 
                  originalBudget: cat.originalBudget || cat.budget, // Store original if not already set
                  budget: (cat.budget || 0) - pullAmount 
              };
          }
          return cat;
      });

      processExpense(pendingExpense, updatedCategories);
      setShowRebalanceModal(false);
      setPendingExpense(null);
  };

  const handleRebalanceSkip = () => {
      if (pendingExpense) processExpense(pendingExpense);
      setShowRebalanceModal(false);
      setPendingExpense(null);
  };

  const handleRebalanceCancel = () => {
      setShowRebalanceModal(false);
      setPendingExpense(null);
      // Re-open expense modal maybe? For now just cancel.
  };

  const updateRebalanceAmount = (catName: string, value: number) => {
      setRebalanceMap({ ...rebalanceMap, [catName]: value });
  };

  const confirmDeleteExpense = (id: string) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Expense',
          message: 'Are you sure you want to delete this expense? The account balance will NOT be reverted automatically.',
          onConfirm: () => {
              updateData({ expenses: data.expenses.filter(e => e.id !== id) });
          }
      });
  };

  const confirmDeleteIncome = (id: string) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Income',
          message: 'Delete this income record? Account balance will NOT be reverted automatically.',
          onConfirm: () => {
              updateData({ incomes: data.incomes.filter(i => i.id !== id) });
          }
      });
  };

  const confirmDeleteTransfer = (id: string) => {
      setConfirmConfig({
          isOpen: true,
          title: 'Delete Transfer',
          message: 'Delete this transfer record? Balances will NOT be reverted automatically.',
          onConfirm: () => {
              updateData({ transfers: data.transfers.filter(t => t.id !== id) });
          }
      });
  };

  const initiateEdit = (account: BankAccount | DebtAccount, type: 'bank' | 'debt') => {
      setEditTitle(`Update ${account.name}`);
      setEditValue(type === 'bank' ? (account as BankAccount).balance.toString() : (account as DebtAccount).currentBalance.toString());
      setPendingAccountEdit({
          id: account.id,
          type,
          oldValue: type === 'bank' ? (account as BankAccount).balance : (account as DebtAccount).currentBalance,
          newValue: 0,
          name: account.name
      });
      setShowEditModal(true);
  };

  const handleEditNext = () => {
      const val = parseFloat(editValue);
      if (isNaN(val) || !pendingAccountEdit) return;

      const diff = val - pendingAccountEdit.oldValue;
      if (Math.abs(diff) < 0.01) {
          setShowEditModal(false);
          setPendingAccountEdit(null);
          return;
      }

      setPendingAccountEdit({ ...pendingAccountEdit, newValue: val });
      setReconcileSplits([{ 
          amount: Math.abs(diff).toFixed(2), 
          category: 'Adjustment', 
          note: '' 
      }]);
      
      setShowEditModal(false);
      setShowReconcileModal(true);
  };

  const addSplit = () => {
      setReconcileSplits([...reconcileSplits, { amount: '', category: 'Adjustment', note: '' }]);
  };

  const removeSplit = (index: number) => {
      const newSplits = [...reconcileSplits];
      newSplits.splice(index, 1);
      setReconcileSplits(newSplits);
  };

  const updateSplit = (index: number, field: keyof Split, value: string) => {
      const newSplits = [...reconcileSplits];
      // @ts-ignore
      newSplits[index] = { ...newSplits[index], [field]: value };
      
      // Reset counterParty if category changes from Transfer
      if (field === 'category' && value !== 'Transfer') {
          newSplits[index].counterPartyId = undefined;
      }
      
      setReconcileSplits(newSplits);
  };

  const confirmReconcile = () => {
      if (!pendingAccountEdit) return;

      const diff = pendingAccountEdit.newValue - pendingAccountEdit.oldValue;
      const isBank = pendingAccountEdit.type === 'bank';
      const isIncome = isBank ? diff > 0 : diff < 0; // Bank Increase = Income, Debt Decrease = Income (Paid off)

      // 1. Update The Primary Account Balance
      let updatedBankAccounts = [...data.bankAccounts];
      let updatedDebtAccounts = [...data.debtAccounts];

      if (isBank) {
          updatedBankAccounts = updatedBankAccounts.map(acc => 
             acc.id === pendingAccountEdit.id ? { ...acc, balance: pendingAccountEdit.newValue } : acc
          );
      } else {
          updatedDebtAccounts = updatedDebtAccounts.map(acc => 
             acc.id === pendingAccountEdit.id ? { ...acc, currentBalance: pendingAccountEdit.newValue } : acc
          );
      }

      // 2. Log Transactions & Handle Transfers
      const newExpenses: Expense[] = [];
      const newIncomes: Income[] = [];
      const newTransfers: Transfer[] = [];

      reconcileSplits.forEach(split => {
          const amount = parseFloat(split.amount);
          if (isNaN(amount) || amount <= 0) return;

          if (split.category === 'Transfer' && split.counterPartyId) {
              // Handle Transfer Logic
              // If Primary is Bank Increase (Income) -> Transfer FROM counterParty
              // If Primary is Bank Decrease (Expense) -> Transfer TO counterParty
              
              const isPrimaryReceiving = isIncome; 
              
              // Log Transfer
              newTransfers.push({
                  id: Math.random().toString(36).substr(2, 9),
                  date: new Date().toISOString().split('T')[0],
                  amount: amount,
                  fromAccountId: isPrimaryReceiving ? split.counterPartyId : pendingAccountEdit.id,
                  toAccountId: isPrimaryReceiving ? pendingAccountEdit.id : split.counterPartyId,
                  note: split.note
              });

              // Update Counterparty Balance
              // Identify if counterParty is Bank or Debt
              const cpBankIndex = updatedBankAccounts.findIndex(b => b.id === split.counterPartyId);
              const cpDebtIndex = updatedDebtAccounts.findIndex(d => d.id === split.counterPartyId);

              if (cpBankIndex !== -1) {
                  // It's a bank account
                  const currentVal = updatedBankAccounts[cpBankIndex].balance;
                  // If Primary Received, Counterparty Lost (Expense)
                  updatedBankAccounts[cpBankIndex].balance = isPrimaryReceiving ? currentVal - amount : currentVal + amount;
              } else if (cpDebtIndex !== -1) {
                  // It's a debt account
                  const currentVal = updatedDebtAccounts[cpDebtIndex].currentBalance;
                  // If Primary Received (e.g. Loan payout), Debt Increased
                  // If Primary Sent (e.g. Payment), Debt Decreased
                  updatedDebtAccounts[cpDebtIndex].currentBalance = isPrimaryReceiving ? currentVal + amount : currentVal - amount;
              }

          } else if (isIncome) {
              // Log Income
              newIncomes.push({
                  id: Math.random().toString(36).substr(2, 9),
                  date: new Date().toISOString().split('T')[0],
                  source: split.category,
                  amount: amount,
                  accountId: pendingAccountEdit.id,
                  note: split.note
              });
          } else {
              // Log Expense
              newExpenses.push({
                  id: Math.random().toString(36).substr(2, 9),
                  date: new Date().toISOString().split('T')[0],
                  categoryName: split.category === 'Adjustment' ? 'Adjustment' : split.category,
                  amount: amount,
                  note: split.note || 'Balance Correction',
                  icon: data.budgetConfig.livingCategories.find(c => c.name === split.category)?.icon || '🔧',
                  sourceAccountId: pendingAccountEdit.id
              });
          }
      });

      // Update All Data
      updateData({ 
          bankAccounts: updatedBankAccounts,
          debtAccounts: updatedDebtAccounts,
          expenses: [...newExpenses, ...data.expenses],
          // @ts-ignore
          incomes: [...newIncomes, ...data.incomes],
          // @ts-ignore
          transfers: [...newTransfers, ...data.transfers]
      });

      setShowReconcileModal(false);
      setPendingAccountEdit(null);
  };

  // Unified Activity Feed
  const getAllTransactions = () => {
      const all: any[] = [];
      data.expenses.forEach(e => all.push({ ...e, type: 'expense' }));
      data.incomes.forEach(i => all.push({ ...i, type: 'income' }));
      data.transfers.forEach(t => all.push({ ...t, type: 'transfer' }));
      return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const groupedTransactions = getAllTransactions()
    .reduce((groups, txn) => {
      const date = txn.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(txn);
      return groups;
    }, {} as Record<string, any[]>);

  // Derived Reconcile Values
  let diff = 0;
  let isIncome = false;
  let totalAssigned = 0;
  
  if (pendingAccountEdit) {
      diff = pendingAccountEdit.newValue - pendingAccountEdit.oldValue;
      const isBank = pendingAccountEdit.type === 'bank';
      isIncome = isBank ? diff > 0 : diff < 0;
      totalAssigned = reconcileSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  }
  const absDiff = Math.abs(diff);
  const remainingReconcile = absDiff - totalAssigned;
  const isReconcileValid = Math.abs(remainingReconcile) < 0.05;

  // Rebalance Calculations
  const availableDonors = data.budgetConfig.livingCategories.filter(c => {
      if (c.locked) return false;
      if (pendingExpense && c.name === pendingExpense.categoryName) return false;
      const spent = getCategorySpend(c.name);
      return (c.budget ?? 0) - spent > 0;
  });
  
  const totalPulled = Object.values(rebalanceMap).reduce((sum: number, val: number) => sum + val, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Net Worth */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col justify-center items-center py-6 bg-gradient-to-br from-accent/10 to-card border-accent/20">
             <span className="text-[10px] text-textSecondary uppercase font-mono tracking-widest font-bold">Net Worth</span>
             <div className="flex items-center gap-2 mt-2">
                <h2 className={`text-2xl font-mono font-bold tracking-tight ${netWorth >= 0 ? 'text-white' : 'text-alert'}`}>
                    {netWorth.toLocaleString()}
                </h2>
                {netWorth >= 0 ? <TrendingUp size={16} className="text-accent"/> : <TrendingDown size={16} className="text-alert"/>}
             </div>
        </Card>
        <div className="flex flex-col gap-3">
            <div className="bg-card border border-border/50 rounded-xl p-3 flex justify-between items-center shadow-sm">
                <span className="text-xs text-textSecondary font-medium">Assets</span>
                <span className="font-mono font-bold text-primary">{totalAssets.toLocaleString()}</span>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-3 flex justify-between items-center shadow-sm">
                <span className="text-xs text-textSecondary font-medium">Debts</span>
                <span className="font-mono font-bold text-alert">-{totalDebt.toLocaleString()}</span>
            </div>
        </div>
      </div>

      {/* Asset Only Mode Toggle */}
      <div 
        onClick={toggleAssetMode}
        className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.99] ${data.assetOnlyMode ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-card border-border'}`}
      >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${data.assetOnlyMode ? 'bg-primary text-white' : 'bg-background text-textSecondary'}`}>
                {data.assetOnlyMode ? <Shield size={18} /> : <ShieldAlert size={18} />}
            </div>
            <div>
                <p className={`text-sm font-bold ${data.assetOnlyMode ? 'text-primary' : 'text-textPrimary'}`}>
                    Asset-Only Mode
                </p>
                <p className="text-[10px] text-textSecondary">
                    {data.assetOnlyMode ? 'Credit cards blocked for spending' : 'Spending allowed on all accounts'}
                </p>
            </div>
        </div>
        <div className={`w-10 h-5 rounded-full relative transition-colors ${data.assetOnlyMode ? 'bg-primary' : 'bg-border'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${data.assetOnlyMode ? 'left-6' : 'left-1'}`} />
        </div>
      </div>

      {/* Bank Accounts */}
      <Card title="ACCOUNTS" className="pb-2">
         {data.bankAccounts.map((acc, idx) => (
             <div 
                key={acc.id} 
                className="group flex justify-between items-center py-3 border-b border-border/40 last:border-0 cursor-pointer active:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
                onClick={() => initiateEdit(acc, 'bank')}
             >
                 <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-full text-textSecondary">
                        <DollarSign size={16} />
                    </div>
                    <span className="text-sm font-medium">{acc.name}</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="font-mono font-bold text-white">{acc.balance.toLocaleString()}</span>
                     <Edit2 size={12} className="text-textSecondary opacity-0 group-hover:opacity-50 transition-opacity"/>
                 </div>
             </div>
         ))}
      </Card>

      {/* Credit Cards */}
      <Card title="DEBT REPAYMENT" action={
          <Button variant="ghost" className="h-7 px-3 text-[10px] bg-card hover:bg-border border-border/50" onClick={() => setShowPaymentModal(true)}>
              PAY OFF
          </Button>
      }>
          {data.debtAccounts.map(acc => {
              const paidOff = acc.startingBalance - acc.currentBalance;
              const isLocked = data.assetOnlyMode;
              return (
                  <div key={acc.id} className={`mb-5 last:mb-0 group ${isLocked ? 'opacity-40' : ''}`}>
                      <div className="flex justify-between text-sm mb-1.5">
                          <span style={{ color: acc.color }} className="font-bold flex items-center gap-2">
                              {acc.name}
                              {isLocked && <Lock size={12} className="text-textSecondary" />}
                          </span>
                          <span 
                            className="font-mono cursor-pointer hover:text-white flex items-center gap-1 text-sm"
                            onClick={() => initiateEdit(acc, 'debt')}
                          >
                              {acc.currentBalance.toLocaleString()} <Edit2 size={10} className="opacity-0 group-hover:opacity-50"/>
                          </span>
                      </div>
                      <ProgressBar value={paidOff} max={acc.startingBalance} color={acc.color} className="h-2" />
                      <div className="flex justify-between mt-1 text-[10px] text-textSecondary font-mono">
                          <span>{((paidOff / acc.startingBalance) * 100).toFixed(0)}% PAID</span>
                          <span>LIMIT: {acc.startingBalance.toLocaleString()}</span>
                      </div>
                  </div>
              )
          })}
          <div className="mt-5 pt-4 border-t border-border/50 flex justify-between items-center">
              <span className="text-xs font-bold text-textSecondary">TOTAL DEBT</span>
              <span className="font-mono font-bold text-alert text-lg">{totalDebt.toLocaleString()}</span>
          </div>
      </Card>

      {/* Spending Categories */}
      <Card title="BUDGET BREAKDOWN" action={
          <div className="flex gap-2">
            <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => exportData(data, 'file', 'money')}>
              <Download size={14} />
            </Button>
            <Button variant="primary" className="h-8 px-3 text-xs shadow-lg shadow-accent/20" onClick={() => setShowExpenseModal(true)}>
              <Plus size={14} className="mr-1"/> EXPENSE
            </Button>
          </div>
      }>
          <div className="grid gap-5">
              {data.budgetConfig.livingCategories.map((cat, idx) => {
                  const spent = getCategorySpend(cat.name);
                  const budget = cat.budget || 1;
                  const color = getCategoryColor(spent, budget);
                  const isReduced = cat.originalBudget && cat.originalBudget > budget;
                  
                  return (
                      <div key={idx} className="group">
                          <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-2.5">
                                  <span className="text-lg">{cat.icon}</span>
                                  <span className="text-sm font-medium">{cat.name}</span>
                                  {cat.locked && <Lock size={10} className="text-textSecondary" />}
                              </div>
                              <div className="text-xs font-mono flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded">
                                  <span className={spent > budget ? 'text-alert' : 'text-textPrimary'}>{Math.round(spent)}</span>
                                  <span className="text-textSecondary">/</span>
                                  <span 
                                    className="text-textSecondary cursor-pointer hover:text-white"
                                  >
                                      {budget}
                                  </span>
                              </div>
                          </div>
                          <ProgressBar value={spent} max={budget} color={color} className="h-2" />
                          {isReduced && (
                              <p className="text-[9px] text-textMuted mt-1 ml-1">
                                  ↓ reduced from {data.userProfile.currency}{cat.originalBudget} (rebalanced)
                              </p>
                          )}
                      </div>
                  )
              })}
          </div>
      </Card>

      {/* Unified Activity Feed */}
      <div className="pb-20">
          <h3 className="text-textSecondary font-mono text-[10px] uppercase tracking-widest mb-3 ml-1">Recent Activity</h3>
          <div className="space-y-4">
              {Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)).map(date => (
                  <div key={date}>
                      <p className="text-xs text-textSecondary mb-2 font-medium sticky top-[70px] bg-background/95 backdrop-blur py-1 z-10 w-fit px-2 rounded shadow-sm border border-border/30">
                          {new Date(date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <div className="space-y-2">
                          {groupedTransactions[date].map((txn: any) => {
                              const isExpense = txn.type === 'expense';
                              const isIncome = txn.type === 'income';
                              const isTransfer = txn.type === 'transfer';
                              
                              let borderClass = 'border-l-4 border-l-border'; // Default expense
                              if (isIncome) borderClass = 'border-l-4 border-l-primary';
                              if (isTransfer) borderClass = 'border-l-4 border-l-info';

                              return (
                                  <div key={txn.id} className={`bg-card border-y border-r border-border/50 rounded-r-xl rounded-l-md p-3 flex justify-between items-center shadow-sm hover:bg-background/50 transition-colors ${borderClass}`}>
                                      <div className="flex items-center gap-3">
                                          <div className={`text-xl w-8 h-8 flex items-center justify-center rounded-lg ${isTransfer ? 'bg-info/10 text-info' : isIncome ? 'bg-primary/10 text-primary' : 'bg-background/50 text-textSecondary'}`}>
                                              {isExpense ? txn.icon : isTransfer ? <ArrowRightLeft size={16}/> : <TrendingUp size={16}/>}
                                          </div>
                                          <div>
                                              <p className="text-sm font-bold text-textPrimary">
                                                  {isExpense ? txn.categoryName : isTransfer ? 'Transfer' : txn.source}
                                              </p>
                                              <p className="text-[10px] text-textSecondary truncate max-w-[150px]">
                                                  {isExpense && (txn.subcategoryName || 'General')}
                                                  {isTransfer && `To/From Account`}
                                                  {txn.note && <span className="text-textMuted"> • {txn.note}</span>}
                                              </p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <span className={`font-mono font-bold text-sm ${isIncome ? 'text-primary' : isTransfer ? 'text-info' : 'text-textPrimary'}`}>
                                              {isIncome ? '+' : ''}{isExpense ? '-' : ''}{txn.amount}
                                          </span>
                                          <button 
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (isExpense) confirmDeleteExpense(txn.id);
                                                  else if (isIncome) confirmDeleteIncome(txn.id);
                                                  else confirmDeleteTransfer(txn.id);
                                              }} 
                                              className="text-textSecondary hover:text-alert transition-colors p-2"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen} 
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
      />

      {/* MODALS */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        title="Log Debt Payment"
        footer={<Button fullWidth onClick={handleLogPayment}>CONFIRM PAYMENT</Button>}
      >
          <div className="space-y-4">
              <Select 
                label="Select Card"
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
              >
                  {data.debtAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
              </Select>
              
              <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Amount"
                    type="number"
                    inputMode="decimal"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  
                  <Input 
                    label="Date"
                    type="date" 
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
              </div>
          </div>
      </Modal>

      <Modal 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)} 
        title="Add Expense"
        footer={<Button fullWidth onClick={checkBudgetAndAddExpense}>ADD EXPENSE</Button>}
      >
          <div className="space-y-4">
              <Select 
                label="Category"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
              >
                  {data.budgetConfig.livingCategories.map(c => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
              </Select>
              
              {availableSubcategories.length > 0 && (
                  <Select 
                    label="Subcategory"
                    value={expenseSubcategory}
                    onChange={(e) => setExpenseSubcategory(e.target.value)}
                  >
                      {availableSubcategories.map(s => (
                          <option key={s} value={s}>{s}</option>
                      ))}
                  </Select>
              )}

              <Select 
                label="Payment Source"
                value={expenseSource}
                onChange={(e) => setExpenseSource(e.target.value)}
              >
                  <optgroup label="Bank Accounts (Asset)">
                      {data.bankAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                  </optgroup>
                  {/* Hide Debt Optgroup if Asset Only Mode is active */}
                  {!data.assetOnlyMode && (
                      <optgroup label="Credit Cards (Debt)">
                          {data.debtAccounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                      </optgroup>
                  )}
              </Select>

              <div className="grid grid-cols-2 gap-3">
                  <Input 
                    label="Amount"
                    type="number"
                    inputMode="decimal"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  
                  <Input 
                    label="Date"
                    type="date" 
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
              </div>
              
              <Input 
                label="Note (Optional)"
                type="text" 
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                placeholder="Dinner with friends..."
              />
          </div>
      </Modal>

      {/* REBALANCE MODAL */}
      <Modal
        isOpen={showRebalanceModal}
        onClose={handleRebalanceCancel}
        title="⚠️ Budget Exceeded"
        footer={
            <div className="flex flex-col gap-2 w-full">
                 <Button 
                    fullWidth 
                    onClick={handleRebalanceConfirm} 
                    disabled={totalPulled < rebalanceDeficit}
                    className="shadow-lg shadow-accent/20"
                >
                    CONFIRM REBALANCE ({Math.min(100, (Number(totalPulled)/Number(rebalanceDeficit))*100).toFixed(0)}%)
                </Button>
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        fullWidth 
                        onClick={handleRebalanceSkip} 
                        className="border-alert text-alert hover:bg-alert hover:text-white hover:border-alert bg-transparent"
                    >
                        ALLOW OVERSPEND
                    </Button>
                    <Button variant="secondary" fullWidth onClick={handleRebalanceCancel}>
                        CANCEL
                    </Button>
                </div>
            </div>
        }
      >
          <div className="space-y-4">
             <div className="bg-card/50 p-4 rounded-xl border border-border text-center">
                 <p className="text-sm text-textSecondary mb-1">
                     <span className="font-bold text-white">{expenseCategory}</span> is over budget by
                 </p>
                 <p className="text-3xl font-mono font-bold text-alert mb-2">
                     {data.userProfile.currency}{rebalanceDeficit.toFixed(2)}
                 </p>
                 <div className="flex justify-between items-center text-xs bg-background/50 p-2 rounded-lg">
                     <span className="text-textSecondary">Still need to cover:</span>
                     <span className={`font-mono font-bold ${Number(rebalanceDeficit) - Number(totalPulled) > 0 ? 'text-warning' : 'text-accent'}`}>
                         {data.userProfile.currency}{Math.max(0, Number(rebalanceDeficit) - Number(totalPulled)).toFixed(2)}
                     </span>
                 </div>
             </div>

             <p className="text-xs text-textSecondary uppercase tracking-widest font-bold ml-1">Pull funds from:</p>
             
             <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                 {availableDonors.length === 0 && (
                     <p className="text-center text-xs text-textMuted italic py-4">No available budgets found to rebalance from.</p>
                 )}
                 {availableDonors.map(cat => {
                     const currentPull = rebalanceMap[cat.name] || 0;
                     const spent = getCategorySpend(cat.name);
                     const catBudget = cat.budget ?? 0;
                     const available = catBudget - spent;
                     
                     return (
                         <div key={cat.name} className="bg-background/30 p-3 rounded-lg border border-border/30">
                             <div className="flex justify-between mb-2">
                                 <div className="flex items-center gap-2">
                                     <span>{cat.icon}</span>
                                     <span className="text-sm font-medium">{cat.name}</span>
                                 </div>
                                 <span className="text-xs font-mono text-textSecondary">
                                     Avail: {data.userProfile.currency}{available.toFixed(0)}
                                 </span>
                             </div>
                             
                             <input 
                                type="range" 
                                min="0" 
                                max={available} 
                                step="1"
                                value={currentPull}
                                onChange={(e) => updateRebalanceAmount(cat.name, parseFloat(e.target.value))}
                                className="w-full accent-accent h-1.5 bg-border rounded-lg appearance-none cursor-pointer mb-2"
                             />
                             
                             <div className="flex justify-between items-center">
                                 <div className="flex gap-1">
                                    <button onClick={() => updateRebalanceAmount(cat.name, 0)} className="text-[10px] px-2 py-1 bg-card border border-border rounded hover:bg-border">None</button>
                                    <button onClick={() => updateRebalanceAmount(cat.name, Math.floor(available * 0.25))} className="text-[10px] px-2 py-1 bg-card border border-border rounded hover:bg-border">25%</button>
                                    <button onClick={() => updateRebalanceAmount(cat.name, Math.floor(available * 0.5))} className="text-[10px] px-2 py-1 bg-card border border-border rounded hover:bg-border">50%</button>
                                 </div>
                                 <span className={`font-mono font-bold ${currentPull > 0 ? 'text-accent' : 'text-textMuted'}`}>
                                     -{Number(currentPull)}
                                 </span>
                             </div>
                         </div>
                     )
                 })}
             </div>
          </div>
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title={editTitle}
        footer={<Button fullWidth onClick={handleEditNext}>UPDATE</Button>}
      >
          <div className="space-y-4">
              <Input 
                label="New Value"
                type="number"
                inputMode="decimal"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
              />
          </div>
      </Modal>

      <Modal 
        isOpen={showReconcileModal} 
        onClose={() => setShowReconcileModal(false)} 
        title="Track Adjustment"
        footer={
          <div className="flex justify-between items-center gap-3">
              <Button variant="ghost" className="h-10 text-xs flex-1" onClick={addSplit}>
                  + Split
              </Button>
              <Button disabled={!isReconcileValid} onClick={confirmReconcile} className="h-10 text-sm flex-[2]">
                  Confirm & Save
              </Button>
          </div>
        }
      >
          <div className="space-y-4">
              <div className="bg-card/50 p-3 rounded-lg border border-border/50 text-center">
                  <p className="text-xs text-textSecondary uppercase tracking-widest mb-1">
                      {isIncome ? 'Inflow Detected' : 'Outflow Detected'}
                  </p>
                  <p className={`text-2xl font-mono font-bold ${isIncome ? 'text-primary' : 'text-alert'}`}>
                      {isIncome ? '+' : '-'}{absDiff.toFixed(2)}
                  </p>
                  <p className="text-xs text-textSecondary mt-1">
                      Remaining to assign: <span className={Math.abs(remainingReconcile) > 0.05 ? 'text-warning' : 'text-primary'}>{remainingReconcile.toFixed(2)}</span>
                  </p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                  {reconcileSplits.map((split, idx) => (
                      <div key={idx} className="flex flex-col gap-2 bg-background/30 p-2 rounded">
                          <div className="flex gap-2">
                              <div className="w-1/3">
                                  <input 
                                    type="number"
                                    inputMode="decimal"
                                    className="w-full bg-background border border-border rounded px-2 py-2 text-base"
                                    placeholder="Amt"
                                    value={split.amount}
                                    onChange={(e) => updateSplit(idx, 'amount', e.target.value)}
                                  />
                              </div>
                              <div className="flex-1">
                                  <select 
                                    className="w-full bg-background border border-border rounded px-2 py-2 text-base"
                                    value={split.category}
                                    onChange={(e) => updateSplit(idx, 'category', e.target.value)}
                                  >
                                      <option value="" disabled>Type</option>
                                      {isIncome ? (
                                          <>
                                            {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="Transfer">Transfer From...</option>
                                          </>
                                      ) : (
                                          <>
                                              {data.budgetConfig.livingCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                              {data.budgetConfig.fixedObligations.map(c => <option key={c.name} value={c.name}>{c.name} (Fixed)</option>)}
                                              <option value="Adjustment">Adjustment</option>
                                              <option value="Transfer">Transfer To...</option>
                                          </>
                                      )}
                                  </select>
                              </div>
                              <button onClick={() => removeSplit(idx)} className="text-textSecondary hover:text-alert">
                                  <X size={16} />
                              </button>
                          </div>
                          
                          {/* Transfer Counterparty Selection */}
                          {split.category === 'Transfer' && (
                              <div className="px-1">
                                  <select 
                                    className="w-full bg-background border border-border rounded px-2 py-2 text-base"
                                    value={split.counterPartyId || ''}
                                    onChange={(e) => updateSplit(idx, 'counterPartyId', e.target.value)}
                                  >
                                      <option value="" disabled>Select {isIncome ? 'Source' : 'Destination'} Account</option>
                                      <optgroup label="Bank Accounts">
                                          {data.bankAccounts.filter(a => a.id !== pendingAccountEdit?.id).map(a => (
                                              <option key={a.id} value={a.id}>{a.name} ({a.balance})</option>
                                          ))}
                                      </optgroup>
                                      <optgroup label="Debt Accounts">
                                          {data.debtAccounts.filter(a => a.id !== pendingAccountEdit?.id).map(a => (
                                              <option key={a.id} value={a.id}>{a.name}</option>
                                          ))}
                                      </optgroup>
                                  </select>
                              </div>
                          )}

                          <input 
                            type="text"
                            className="w-full bg-background border border-border rounded px-2 py-2 text-base"
                            placeholder="Note (Optional)"
                            value={split.note}
                            onChange={(e) => updateSplit(idx, 'note', e.target.value)}
                          />
                      </div>
                  ))}
              </div>
          </div>
      </Modal>

    </div>
  );
};
