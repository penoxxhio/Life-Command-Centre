import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AccountsList } from './components/AccountsList';
import { BudgetOverview } from './components/BudgetOverview';
import { ExpenseLogger } from './components/ExpenseLogger';
import { TransactionHistory } from './components/TransactionHistory';
import { DebtTracker } from './components/DebtTracker';

type MoneyTab = 'overview' | 'expenses' | 'transactions' | 'debt';

export function MoneyPage() {
  const { data, updateMoney } = useAppStore();
  const money = data.money;
  const [activeTab, setActiveTab] = useState<MoneyTab>('overview');

  const tabs: { id: MoneyTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '\ud83d\udcca' },
    { id: 'expenses', label: 'Log', icon: '\ud83d\udcb8' },
    { id: 'transactions', label: 'History', icon: '\ud83d\udccb' },
    { id: 'debt', label: 'Debt', icon: '\ud83c\udfe6' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-garden text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-earth text-cream'
                : 'bg-cream text-earth/60 hover:text-earth'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AccountsList accounts={money.accounts} currency={money.currency} />
          <BudgetOverview money={money} />
        </div>
      )}

      {activeTab === 'expenses' && (
        <ExpenseLogger
          onAddExpense={(expense) => {
            updateMoney({
              ...money,
              expenses: [...money.expenses, expense],
            });
          }}
          categories={money.budgetConfig?.categories ?? money.budgetConfig?.livingCategories ?? []}
          currency={money.currency}
        />
      )}

      {activeTab === 'transactions' && (
        <TransactionHistory
          transactions={money.transactions}
          currency={money.currency}
        />
      )}

      {activeTab === 'debt' && (
        <DebtTracker
          debts={money.debtAccounts?.length ? money.debtAccounts : money.debts}
          currency={money.currency}
          onUpdateDebts={(debts) => {
            updateMoney({ ...money, debtAccounts: debts, debts });
          }}
        />
      )}
    </div>
  );
}
