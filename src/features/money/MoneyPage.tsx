import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, CreditCard, TrendingDown, PiggyBank, ArrowUpDown, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassModal, GlassProgress } from '../../components/ui';
import type { Transaction, Account } from '../../types';

const EXPENSE_CATEGORIES = [
  { value: 'Housing', label: 'Housing' },
  { value: 'Food', label: 'Food' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Health', label: 'Health' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' },
];

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
  { value: 'cash', label: 'Cash' },
  { value: 'crypto', label: 'Crypto' },
];

export function MoneyPage() {
  const data = useAppStore((s) => s.data);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const addAccount = useAppStore((s) => s.addAccount);
  const deleteAccount = useAppStore((s) => s.deleteAccount);
  const { money, profile } = data;

  const [showExpense, setShowExpense] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expCat, setExpCat] = useState('Food');
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState('checking');
  const [accBalance, setAccBalance] = useState('');

  const netWorth = useMemo(() =>
    money.accounts.reduce((s, a) =>
      s + (a.type === 'credit' || a.type === 'loan' ? -a.balance : a.balance), 0
    ), [money.accounts]
  );

  const totalDebt = useMemo(() =>
    money.debts.reduce((s, d) => s + d.balance, 0), [money.debts]
  );

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const monthTx = useMemo(() =>
    money.transactions.filter((t) => t.date >= monthStart),
    [money.transactions, monthStart]
  );
  const monthSpending = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const handleAddExpense = () => {
    if (!expAmount || !expDesc.trim()) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: parseFloat(expAmount),
      category: expCat,
      description: expDesc.trim(),
      date: new Date().toISOString().split('T')[0],
      accountId: money.accounts[0]?.id || '',
    };
    addTransaction(tx);
    setExpAmount('');
    setExpDesc('');
    setShowExpense(false);
  };

  const handleAddAccount = () => {
    if (!accName.trim()) return;
    const acc: Account = {
      id: Date.now().toString(),
      name: accName.trim(),
      type: accType as Account['type'],
      balance: parseFloat(accBalance) || 0,
      currency: profile.currency,
      color: '#00d4ff',
      icon: 'Wallet',
    };
    addAccount(acc);
    setAccName('');
    setAccBalance('');
    setShowAccount(false);
  };

  const containerV = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemV = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="px-4 pt-6 pb-28 max-w-lg mx-auto space-y-5" variants={containerV} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemV} className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold text-void-100">Money</h1>
        <GlassButton variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowExpense(true)}>
          Expense
        </GlassButton>
      </motion.div>

      {/* Net Worth + Month Summary */}
      <motion.div variants={itemV}>
        <GlassCard variant="neon" padding="md" glow>
          <div className="text-center">
            <p className="text-[10px] text-void-400 uppercase tracking-wider">Net Worth</p>
            <p className="font-display text-3xl font-bold text-void-100 mt-1">
              {profile.currency} {netWorth.toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-[10px] text-void-400 uppercase tracking-wider">Income</p>
              <p className="font-mono text-sm text-emerald-400">+{monthIncome.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-void-400 uppercase tracking-wider">Spent</p>
              <p className="font-mono text-sm text-hp">-{monthSpending.toLocaleString()}</p>
            </div>
          </div>
          {money.monthlyIncome > 0 && (
            <GlassProgress
              value={monthSpending}
              max={money.monthlyIncome}
              color={monthSpending > money.monthlyIncome * 0.9 ? 'red' : 'neon'}
              size="sm"
              className="mt-3"
              label="Budget used"
              showValue
            />
          )}
        </GlassCard>
      </motion.div>

      {/* Accounts */}
      <motion.div variants={itemV}>
        <div className="flex justify-between items-center mb-3">
          <p className="section-title">Accounts</p>
          <GlassButton variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setShowAccount(true)}>
            Add
          </GlassButton>
        </div>
        {money.accounts.length === 0 ? (
          <GlassCard padding="md">
            <p className="text-center text-void-400 text-sm">No accounts yet. Add your first one!</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {money.accounts.map((acc) => (
              <GlassCard key={acc.id} hover padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-neon-500/10">
                      {acc.type === 'credit' ? <CreditCard size={16} className="text-hp" /> :
                       acc.type === 'savings' ? <PiggyBank size={16} className="text-emerald-400" /> :
                       <Wallet size={16} className="text-neon-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-void-100">{acc.name}</p>
                      <p className="text-[10px] text-void-400 uppercase">{acc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-mono text-sm font-semibold ${acc.type === 'credit' ? 'text-hp' : 'text-void-100'}`}>
                      {profile.currency} {acc.balance.toLocaleString()}
                    </p>
                    <button onClick={() => deleteAccount(acc.id)} className="p-1 text-void-500 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>

      {/* Budget Categories */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Budget Breakdown</p>
        <GlassCard padding="md">
          <div className="space-y-3">
            {money.budgetCategories.filter((c) => c.limit > 0 || c.spent > 0).length === 0 ? (
              <p className="text-center text-void-400 text-sm">Set budget limits in Settings</p>
            ) : (
              money.budgetCategories
                .filter((c) => c.limit > 0 || c.spent > 0)
                .map((cat) => (
                  <GlassProgress
                    key={cat.id}
                    value={cat.spent}
                    max={cat.limit || 1}
                    color={cat.spent > cat.limit ? 'red' : 'neon'}
                    size="sm"
                    label={cat.name}
                    showValue
                  />
                ))
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemV}>
        <p className="section-title mb-3">Recent</p>
        {money.transactions.length === 0 ? (
          <GlassCard padding="md">
            <p className="text-center text-void-400 text-sm">No transactions yet</p>
          </GlassCard>
        ) : (
          <div className="space-y-1.5">
            {money.transactions.slice(0, 10).map((tx) => (
              <GlassCard key={tx.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${tx.type === 'expense' ? 'bg-hp/10' : 'bg-emerald-500/10'}`}>
                      {tx.type === 'expense' ? <TrendingDown size={14} className="text-hp" /> : <ArrowUpDown size={14} className="text-emerald-400" />}
                    </div>
                    <div>
                      <p className="text-sm text-void-100">{tx.description}</p>
                      <p className="text-[10px] text-void-500">{tx.category} &middot; {tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-mono text-sm ${tx.type === 'expense' ? 'text-hp' : 'text-emerald-400'}`}>
                    {tx.type === 'expense' ? '-' : '+'}{tx.amount.toLocaleString()}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Expense Modal */}
      <GlassModal isOpen={showExpense} onClose={() => setShowExpense(false)} title="Log Expense">
        <div className="space-y-4">
          <GlassInput label="Amount" type="number" placeholder="0" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} suffix={profile.currency} autoFocus />
          <GlassInput label="Description" placeholder="What did you spend on?" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
          <GlassSelect label="Category" value={expCat} onChange={(e) => setExpCat(e.target.value)} options={EXPENSE_CATEGORIES} />
          <GlassButton variant="primary" fullWidth onClick={handleAddExpense} disabled={!expAmount || !expDesc.trim()}>
            Log Expense
          </GlassButton>
        </div>
      </GlassModal>

      {/* Add Account Modal */}
      <GlassModal isOpen={showAccount} onClose={() => setShowAccount(false)} title="Add Account">
        <div className="space-y-4">
          <GlassInput label="Account Name" placeholder="e.g. Main Checking" value={accName} onChange={(e) => setAccName(e.target.value)} autoFocus />
          <GlassSelect label="Type" value={accType} onChange={(e) => setAccType(e.target.value)} options={ACCOUNT_TYPES} />
          <GlassInput label="Balance" type="number" placeholder="0" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} suffix={profile.currency} />
          <GlassButton variant="primary" fullWidth onClick={handleAddAccount} disabled={!accName.trim()}>
            Add Account
          </GlassButton>
        </div>
      </GlassModal>
    </motion.div>
  );
}
