import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowDownUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AccountsList } from './components/AccountsList';
import { ExpenseLogger } from './components/ExpenseLogger';
import { BudgetOverview } from './components/BudgetOverview';
import { TransactionHistory } from './components/TransactionHistory';
import { DebtTracker } from './components/DebtTracker';
import { RecurringManager } from './components/RecurringManager';

type MoneyTab = 'overview' | 'transactions' | 'debts' | 'recurring';

export const MoneyPage: React.FC = () => {
  const { money } = useAppStore();
  const [activeTab, setActiveTab] = useState<MoneyTab>('overview');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const currency = money.currency ?? 'AED';

  const totalBalance = useMemo(() => {
    return (money.accounts ?? []).reduce((sum, a) => sum + (a.balance ?? 0), 0);
  }, [money.accounts]);

  const monthlySpent = money.monthlySpent ?? 0;
  const monthlyIncome = money.monthlyIncome ?? 0;
  const remaining = monthlyIncome - monthlySpent;

  const tabs: { key: MoneyTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'transactions', label: 'History' },
    { key: 'debts', label: 'Debts' },
    { key: 'recurring', label: 'Recurring' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">
      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-earth-500 mb-0.5">Balance</p>
          <p className="text-lg font-display font-bold text-earth-900">
            {currency} {totalBalance.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-earth-500 mb-0.5">Spent</p>
          <p className="text-lg font-display font-bold text-terracotta-600">
            {currency} {monthlySpent.toLocaleString()}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-earth-500 mb-0.5">Left</p>
          <p className={`text-lg font-display font-bold ${remaining >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
            {currency} {remaining.toLocaleString()}
          </p>
        </Card>
      </motion.div>

      {/* Tab Bar */}
      <motion.div variants={item} className="flex gap-1 bg-cream-100 p-1 rounded-garden-lg">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-garden transition-all ${
              activeTab === tab.key
                ? 'bg-white text-earth-900 shadow-garden'
                : 'text-earth-500 hover:text-earth-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={item}>
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <AccountsList />
            <BudgetOverview />
          </div>
        )}
        {activeTab === 'transactions' && <TransactionHistory />}
        {activeTab === 'debts' && <DebtTracker />}
        {activeTab === 'recurring' && <RecurringManager />}
      </motion.div>

      {/* FAB */}
      <motion.div className="fixed bottom-24 right-5 z-30" whileTap={{ scale: 0.9 }}>
        <Button
          variant="warm"
          size="lg"
          onClick={() => setShowExpenseModal(true)}
          className="rounded-full w-14 h-14 p-0 shadow-warm-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Log Expense"
      >
        <ExpenseLogger onClose={() => setShowExpenseModal(false)} />
      </Modal>
    </motion.div>
  );
};
