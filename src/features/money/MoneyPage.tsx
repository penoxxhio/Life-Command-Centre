import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BudgetOverview } from './components/BudgetOverview';
import { ExpenseLogger } from './components/ExpenseLogger';
import { DebtTracker } from './components/DebtTracker';
import { AccountsList } from './components/AccountsList';
import { RecurringManager } from './components/RecurringManager';
import { TransactionHistory } from './components/TransactionHistory';
import { Button } from '@/components/ui/Button';

type Tab = 'overview' | 'expenses' | 'debts' | 'accounts' | 'recurring' | 'history';

export function MoneyPage() {
  const { data, updateMoney } = useAppStore();
  const money = data.money;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showExpenseLogger, setShowExpenseLogger] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'debts', label: 'Debts' },
    { key: 'accounts', label: 'Accounts' },
    { key: 'recurring', label: 'Recurring' },
    { key: 'history', label: 'History' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-earth-900">Money</h1>
        <Button size="sm" onClick={() => setShowExpenseLogger(true)}>+ Expense</Button>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-sage-600 text-white' : 'bg-earth-100 text-earth-600 hover:bg-earth-200'}`}>{tab.label}</button>
        ))}
      </div>
      {activeTab === 'overview' && <BudgetOverview money={money} />}
      {activeTab === 'expenses' && <TransactionHistory />}
      {activeTab === 'debts' && <DebtTracker debts={money.debts} currency={data.profile.currency} onUpdateDebts={(debts) => updateMoney({ ...money, debts })} />}
      {activeTab === 'accounts' && <AccountsList />}
      {activeTab === 'recurring' && <RecurringManager />}
      {activeTab === 'history' && <TransactionHistory />}
      {showExpenseLogger && <ExpenseLogger onClose={() => setShowExpenseLogger(false)} />}
    </div>
  );
}
