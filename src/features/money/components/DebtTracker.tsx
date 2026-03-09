import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Debt } from '@/types';

export const DebtTracker: React.FC = () => {
  const { data, updateMoney } = useAppStore();
  const money = data.money;
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const debts = money.debts ?? [];
  const currency = money.currency ?? 'AED';

  const handleAdd = () => {
    if (!name.trim() || !total) return;
    const debt: Debt = { id: Date.now().toString(), name: name.trim(), totalAmount: parseFloat(total), paidAmount: parseFloat(paid) || 0, createdAt: new Date().toISOString() };
    updateMoney({ debts: [...debts, debt] });
    setName(''); setTotal(''); setPaid(''); setShowAdd(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    updateMoney({ debts: debts.filter((d: any) => d.id !== deleteId) });
    setDeleteId(null);
  };

  const totalDebt = debts.reduce((s: number, d: any) => s + d.totalAmount, 0);
  const totalPaid = debts.reduce((s: number, d: any) => s + d.paidAmount, 0);

  return (
    <>
      {debts.length > 0 && (
        <Card className="p-5 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-earth-600 font-medium">Total Debt Progress</span>
            <span className="text-earth-500">{currency} {totalPaid.toLocaleString()} / {currency} {totalDebt.toLocaleString()}</span>
          </div>
          <ProgressBar value={totalPaid} max={totalDebt || 1} variant="sage" size="lg" />
        </Card>
      )}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-earth-900">Debts</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      {debts.length === 0 ? (
        <Card className="p-8 text-center"><Target className="w-10 h-10 text-earth-300 mx-auto mb-2" /><p className="text-sm text-earth-500">No debts tracked. That's great!</p></Card>
      ) : (
        <div className="space-y-3">
          {debts.map((debt: any) => {
            const pct = debt.totalAmount > 0 ? Math.round((debt.paidAmount / debt.totalAmount) * 100) : 0;
            return (
              <motion.div key={debt.id} layout>
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="font-medium text-earth-900">{debt.name}</p><p className="text-xs text-earth-500">{pct}% paid off</p></div>
                    <button onClick={() => setDeleteId(debt.id)} className="text-earth-400 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <ProgressBar value={debt.paidAmount} max={debt.totalAmount || 1} variant={pct >= 75 ? 'sage' : 'amber'} size="md" />
                  <div className="flex justify-between text-xs text-earth-500 mt-1.5">
                    <span>{currency} {debt.paidAmount.toLocaleString()} paid</span>
                    <span>{currency} {(debt.totalAmount - debt.paidAmount).toLocaleString()} left</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Debt">
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g. Car Loan" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Total Amount" type="number" placeholder="0" value={total} onChange={(e) => setTotal(e.target.value)} />
          <Input label="Already Paid" type="number" placeholder="0" value={paid} onChange={(e) => setPaid(e.target.value)} />
          <Button variant="primary" fullWidth onClick={handleAdd}>Add Debt</Button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Debt" message="Are you sure you want to remove this debt?" confirmLabel="Delete" variant="danger" />
    </>
  );
};