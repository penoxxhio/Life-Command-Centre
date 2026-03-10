import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EXPENSE_CATEGORIES } from '@/constants';
import type { Transaction } from '@/types';

interface ExpenseLoggerProps { onClose: () => void; }

export function ExpenseLogger({ onClose }: ExpenseLoggerProps) {
  const { data, updateMoney } = useAppStore();
  const money = data.money;
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.name ?? 'food');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const newTransaction: Transaction = { id: Date.now().toString(), amount: parseFloat(amount), category, description: note, date: new Date().toISOString(), type: 'expense' };
    updateMoney({ ...money, transactions: [...money.transactions, newTransaction] });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <Card className="w-full max-w-md rounded-b-none p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-earth-900">Log Expense</h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-600">{'\u2715'}</button>
        </div>
        <div><label className="text-sm text-earth-600 mb-1 block">Amount</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" autoFocus /></div>
        <div>
          <label className="text-sm text-earth-600 mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button key={cat.name} onClick={() => setCategory(cat.name)} className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${category === cat.name ? 'bg-sage-100 text-sage-700 ring-2 ring-sage-400' : 'bg-earth-50 text-earth-600 hover:bg-earth-100'}`}>
                <span>{cat.icon}</span><span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div><label className="text-sm text-earth-600 mb-1 block">Note (optional)</label><input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was this for?" className="w-full border border-earth-200 rounded-lg px-3 py-2 text-sm" /></div>
        <div className="flex gap-2"><Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button><Button onClick={handleSubmit} className="flex-1">Save</Button></div>
      </Card>
    </div>
  );
}
