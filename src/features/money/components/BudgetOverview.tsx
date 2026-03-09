import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EXPENSE_CATEGORIES } from '@/constants';

export const BudgetOverview: React.FC = () => {
  const { data } = useAppStore();
  const money = data.money;
  const currency = money.currency ?? 'AED';
  const income = money.monthlyIncome ?? 0;
  const spent = money.monthlySpent ?? 0;
  const transactions = money.transactions ?? [];

  const categorySpending = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
    });
    const grouped: Record<string, number> = {};
    thisMonth.forEach((t: any) => { grouped[t.category] = (grouped[t.category] ?? 0) + t.amount; });
    return EXPENSE_CATEGORIES.map((cat) => ({ ...cat, spent: grouped[cat.key] ?? 0 })).filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent);
  }, [transactions]);

  const savingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-earth-900">Monthly Budget</h3>
          <span className={`text-sm font-bold ${savingsRate >= 20 ? 'text-sage-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>{savingsRate}% saved</span>
        </div>
        <ProgressBar value={spent} max={income || 1} variant={spent > income ? 'terracotta' : 'sage'} size="lg" showLabel />
        <div className="flex justify-between text-xs text-earth-500 mt-2">
          <span>{currency} {spent.toLocaleString()} spent</span>
          <span>{currency} {income.toLocaleString()} income</span>
        </div>
      </Card>
      {categorySpending.length > 0 && (
        <Card className="p-5">
          <h3 className="font-display font-bold text-earth-900 mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {categorySpending.map((cat) => (
              <div key={cat.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2"><span>{cat.emoji}</span><span className="text-earth-700 font-medium">{cat.label}</span></span>
                  <span className="text-earth-500">{currency} {cat.spent.toLocaleString()}</span>
                </div>
                <ProgressBar value={cat.spent} max={spent || 1} variant="amber" size="sm" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};