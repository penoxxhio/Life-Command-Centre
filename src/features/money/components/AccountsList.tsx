import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Building2, Smartphone, PiggyBank } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { Account } from '@/types';

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
  bank: <Building2 className="w-5 h-5" />,
  card: <CreditCard className="w-5 h-5" />,
  ewallet: <Smartphone className="w-5 h-5" />,
  savings: <PiggyBank className="w-5 h-5" />,
};

const ACCOUNT_COLORS: Record<string, string> = {
  bank: 'bg-sage-100 text-sage-600',
  card: 'bg-amber-100 text-amber-600',
  ewallet: 'bg-terracotta-100 text-terracotta-600',
  savings: 'bg-sky-100 text-sky-600',
};

export const AccountsList: React.FC = () => {
  const { money, setMoney } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('bank');
  const [newBalance, setNewBalance] = useState('');

  const accounts = money.accounts ?? [];
  const currency = money.currency ?? 'AED';

  const handleAdd = () => {
    if (!newName.trim()) return;
    const account: Account = {
      id: Date.now().toString(),
      name: newName.trim(),
      type: newType,
      balance: parseFloat(newBalance) || 0,
      currency,
    };
    setMoney({ accounts: [...accounts, account] });
    setNewName('');
    setNewBalance('');
    setShowAdd(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-earth-900">Accounts</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)} icon={<Plus className="w-4 h-4" />}>
          Add
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="p-6 text-center">
          <PiggyBank className="w-10 h-10 text-earth-300 mx-auto mb-2" />
          <p className="text-sm text-earth-500">No accounts yet. Add one to start tracking.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <motion.div key={account.id} layout>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ACCOUNT_COLORS[account.type] ?? 'bg-cream-100 text-earth-500'}`}>
                    {ACCOUNT_ICONS[account.type] ?? <CreditCard className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-earth-900">{account.name}</p>
                    <p className="text-xs text-earth-500 capitalize">{account.type}</p>
                  </div>
                  <p className="font-display font-bold text-earth-900">
                    {currency} {(account.balance ?? 0).toLocaleString()}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Account">
        <div className="space-y-4">
          <Input label="Account Name" placeholder="e.g. ADCB Current" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1.5">Type</label>
            <div className="flex gap-2">
              {Object.keys(ACCOUNT_ICONS).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-garden text-sm capitalize transition-all ${
                    newType === type ? 'bg-sage-500 text-white' : 'bg-cream-100 text-earth-600'
                  }`}
                >
                  {ACCOUNT_ICONS[type]}
                  {type}
                </button>
              ))}
            </div>
          </div>
          <Input label="Current Balance" type="number" placeholder="0" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} />
          <Button variant="primary" fullWidth onClick={handleAdd}>Add Account</Button>
        </div>
      </Modal>
    </>
  );
};
