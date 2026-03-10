import { useState } from 'react';
import type { DebtAccount } from '@/types';

interface DebtTrackerProps {
  debts: DebtAccount[];
  currency: string;
  onUpdateDebts: (debts: DebtAccount[]) => void;
}

export function DebtTracker({ debts, currency, onUpdateDebts }: DebtTrackerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');

  const handleAdd = () => {
    if (!name || !balance) return;
    const newDebt: DebtAccount = {
      id: Date.now().toString(),
      name,
      balance: parseFloat(balance),
      interestRate: interestRate ? parseFloat(interestRate) : 0,
      minimumPayment: minimumPayment ? parseFloat(minimumPayment) : 0,
    };
    onUpdateDebts([...debts, newDebt]);
    setName('');
    setBalance('');
    setInterestRate('');
    setMinimumPayment('');
    setShowAdd(false);
  };

  const totalDebt = debts.reduce((sum, d) => sum + (d.balance ?? 0), 0);

  return (
    <div className="bg-white rounded-garden p-4 shadow-garden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-earth">Debt Tracker</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm text-sage hover:text-sage/80"
        >
          {showAdd ? 'Cancel' : '+ Add Debt'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-terracotta/10 rounded-garden">
          <p className="text-xs text-earth/60">Total Outstanding</p>
          <p className="text-lg font-bold text-terracotta">{currency} {totalDebt.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-sage/10 rounded-garden">
          <p className="text-xs text-earth/60">Accounts</p>
          <p className="text-lg font-bold text-sage">{debts.length}</p>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="space-y-3 mb-4 p-3 bg-cream rounded-garden">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Debt name"
            className="w-full p-2 rounded-garden border border-earth/20 text-sm"
          />
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="Outstanding balance"
            className="w-full p-2 rounded-garden border border-earth/20 text-sm"
          />
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="Interest rate % (optional)"
            className="w-full p-2 rounded-garden border border-earth/20 text-sm"
          />
          <input
            type="number"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            placeholder="Minimum payment (optional)"
            className="w-full p-2 rounded-garden border border-earth/20 text-sm"
          />
          <button
            onClick={handleAdd}
            className="w-full py-2 bg-earth text-cream rounded-garden text-sm font-medium"
          >
            Add Debt
          </button>
        </div>
      )}

      {/* Debt List */}
      <div className="space-y-3">
        {debts.map((debt) => (
          <div key={debt.id} className="p-3 bg-cream/50 rounded-garden">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-earth">{debt.name}</span>
              <span className="text-sm font-bold text-terracotta">
                {currency} {(debt.balance ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-earth/60">
              {debt.interestRate > 0 && <span>{debt.interestRate}% APR</span>}
              {debt.minimumPayment > 0 && <span>Min: {currency} {debt.minimumPayment.toLocaleString()}</span>}
            </div>
          </div>
        ))}
        {debts.length === 0 && (
          <p className="text-sm text-earth/40 text-center py-4">No debts tracked yet</p>
        )}
      </div>
    </div>
  );
}
