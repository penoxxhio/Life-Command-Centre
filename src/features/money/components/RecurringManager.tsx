import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Repeat, Trash2, Calendar } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { RecurringExpense } from '@/types';

export const RecurringManager: React.FC = () => {
  const { data, updateMoney } = useAppStore();
  const money = data.money;
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [dueDay, setDueDay] = useState('1');
  const recurring = money.recurring ?? [];
  const currency = money.currency ?? 'AED';

  const monthlyTotal = recurring.reduce((sum: number, r: any) => {
    if (r.frequency === 'monthly') return sum + r.amount;
    if (r.frequency === 'weekly') return sum + r.amount * 4.33;
    if (r.frequency === 'yearly') return sum + r.amount / 12;
    return sum;
  }, 0);

  const handleAdd = () => {
    if (!name.trim() || !amount) return;
    const item: RecurringExpense = { id: Date.now().toString(), name: name.trim(), amount: parseFloat(amount), category: 'other', frequency, nextDue: new Date().toISOString(), dueDay: parseInt(dueDay) || 1, active: true };
    updateMoney({ recurring: [...recurring, item] });
    setName(''); setAmount(''); setShowAdd(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    updateMoney({ recurring: recurring.filter((r: any) => r.id !== deleteId) });
    setDeleteId(null);
  };

  return (
    <>
      {recurring.length > 0 && (
        <Card className="p-4 mb-4 bg-gradient-to-r from-amber-50 to-cream-50 border-amber-200">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm text-earth-600">Monthly Commitments</p>
              <p className="text-lg font-display font-bold text-earth-900">{currency} {Math.round(monthlyTotal).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      )}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-earth-900">Recurring</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      {recurring.length === 0 ? (
        <Card className="p-8 text-center"><Calendar className="w-10 h-10 text-earth-300 mx-auto mb-2" /><p className="text-sm text-earth-500">No recurring expenses tracked</p></Card>
      ) : (
        <div className="space-y-2">
          {recurring.map((item: any) => (
            <motion.div key={item.id} layout>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><Repeat className="w-4 h-4 text-amber-600" /></div>
                    <div><p className="font-medium text-earth-900">{item.name}</p><p className="text-xs text-earth-500 capitalize">{item.frequency} {item.dueDay ? `- Day ${item.dueDay}` : ''}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-earth-900">{currency} {item.amount.toLocaleString()}</span>
                    <button onClick={() => setDeleteId(item.id)} className="text-earth-400 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Recurring Expense">
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g. Netflix, Rent" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Amount" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Frequency</label>
            <div className="flex gap-2">
              {(['weekly', 'monthly', 'yearly'] as const).map((f) => (
                <button key={f} onClick={() => setFrequency(f)} className={`px-3 py-1.5 rounded-garden text-sm capitalize transition-all ${frequency === f ? 'bg-sage-500 text-white' : 'bg-cream-100 text-earth-600'}`}>{f}</button>
              ))}
            </div>
          </div>
          <Input label="Due Day" type="number" placeholder="1" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
          <Button variant="primary" fullWidth onClick={handleAdd}>Add Recurring</Button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Recurring" message="Remove this recurring expense?" confirmLabel="Delete" variant="danger" />
    </>
  );
};
