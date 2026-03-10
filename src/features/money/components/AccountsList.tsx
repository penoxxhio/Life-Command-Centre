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
  const { data, updateMoney } = useAppStore();
  const money = data.money;
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<Account['type']>('bank');
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
    updateMoney({ accounts: [...accounts, account] });
    setNewName('');
    setNewBalance('');
    setShowAdd(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-earth-900">Accounts</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)} icon={<Plus className="w-4 h-4" />}>Add</Button>
      </div>
      {accounts.length === 0 ? (
        <Card className="p-6 text-center">
          <PiggyBank className="w-10 h-10 text-earth-300 mx-auto mb-2" />
          <p className="text-sm text-earth-500">No accounts yet. Add one to start tracking.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {accounts.map((account: any) => (
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
                  <p className="font-bold text-earth-900">
                    {account.balance.toLocaleString()} {account.currency || currency}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Account">
        <div className="space-y-4">
          <Input
            label="Account Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Main Checking"
          />
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(ACCOUNT_ICONS).map(([type, icon]) => (
              <button
                key={type}
                onClick={() => setNewType(type as Account['type'])}
                className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${newType === type ? 'bg-sage-100 ring-2 ring-sage-400' : 'bg-cream-50 hover:bg-cream-100'}`}
              >
                {icon}
                <span className="text-xs capitalize">{type}</span>
              </button>
            ))}
          </div>
          <Input
            label="Current Balance"
            type="number"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            placeholder="0.00"
          />
          <Button onClick={handleAdd} fullWidth>
            Add Account
          </Button>
        </div>
      </Modal>
    </>
  );
};