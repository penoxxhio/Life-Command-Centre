import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EXPENSE_CATEGORIES } from '@/constants';
import type { Transaction } from '@/types';

interface ExpenseLoggerProps {
  onClose: () => void;
}

export const ExpenseLogger: React.FC<ExpenseLoggerProps> = ({ onClose }) => {
  const { money, setMoney } = useAppStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('food');
  const [accountId, setAccountId] = useState(money.accounts?.[0]?.id ?? '');

  const currency = money.currency ?? 'AED';
  const accounts = money.accounts ?? [];

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      amount: value,
      description: description.trim() || category,
      category,
      accountId,
      type: 'expense',
      date: new Date().toISOString(),
    };

    const transactions = [...(money.transactions ?? []), transaction];
    const monthlySpent = (money.monthlySpent ?? 0) + value;

    // Update account balance
    const updatedAccounts = accounts.map((a) =>
      a.id === accountId ? { ...a, balance: (a.balance ?? 0) - value } : a
    );

    setMoney({ transactions, monthlySpent, accounts: updatedAccounts });
    onClose();
  };

  return (
    <div className="space-y-4">
      <Input
        label={`Amount (${currency})`}
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        autoFocus
      />

      <Input
        label="Description"
        placeholder="What was it for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-earth-700 mb-1.5">Category</label>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-garden text-sm transition-all ${
                category === cat.key
                  ? 'bg-sage-500 text-white shadow-garden'
                  : 'bg-cream-100 text-earth-600 hover:bg-cream-200'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {accounts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-earth-700 mb-1.5">From Account</label>
          <div className="flex flex-wrap gap-2">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setAccountId(acc.id)}
                className={`px-3 py-1.5 rounded-garden text-sm transition-all ${
                  accountId === acc.id
                    ? 'bg-sage-500 text-white'
                    : 'bg-cream-100 text-earth-600'
                }`}
              >
                {acc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="warm" fullWidth onClick={handleSubmit}>Log Expense</Button>
      </div>
    </div>
  );
};
