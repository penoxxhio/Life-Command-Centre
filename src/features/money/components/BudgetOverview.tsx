import { EXPENSE_CATEGORIES } from '@/constants';
import type { MoneyData } from '@/types';
import { getMonthlySpent, getMonthlyIncome } from '@/utils/computedHelpers';

interface BudgetOverviewProps {
  money: MoneyData;
}

export function BudgetOverview({ money }: BudgetOverviewProps) {
  const budget = money.budgetConfig;
  const monthlySpent = getMonthlySpent(money.transactions, money.expenses);
  const monthlyIncome = getMonthlyIncome(money.transactions, money.income);
  const remaining = (budget?.monthlyBudget ?? monthlyIncome) - monthlySpent;

  const categorySpending = EXPENSE_CATEGORIES.map((cat) => {
    const spent = money.expenses
      .filter((e) => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...cat, spent };
  });

  return (
    <div className="bg-white rounded-garden p-4 shadow-garden">
      <h3 className="text-lg font-semibold text-earth mb-4">Budget Overview</h3>

      {/* Monthly Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-sage/10 rounded-garden">
          <p className="text-xs text-earth/60">Income</p>
          <p className="text-lg font-bold text-sage">{money.currency} {monthlyIncome.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-terracotta/10 rounded-garden">
          <p className="text-xs text-earth/60">Spent</p>
          <p className="text-lg font-bold text-terracotta">{money.currency} {monthlySpent.toLocaleString()}</p>
        </div>
        <div className={`text-center p-3 rounded-garden ${remaining >= 0 ? 'bg-leaf/10' : 'bg-red-50'}`}>
          <p className="text-xs text-earth/60">Remaining</p>
          <p className={`text-lg font-bold ${remaining >= 0 ? 'text-leaf' : 'text-red-500'}`}>
            {money.currency} {Math.abs(remaining).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-earth/80">By Category</h4>
        {categorySpending
          .filter((c) => c.spent > 0)
          .sort((a, b) => b.spent - a.spent)
          .map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span className="text-sm text-earth">{cat.name}</span>
              </div>
              <span className="text-sm font-medium text-earth">
                {money.currency} {cat.spent.toLocaleString()}
              </span>
            </div>
          ))}
        {categorySpending.every((c) => c.spent === 0) && (
          <p className="text-sm text-earth/40 text-center py-4">No expenses this month</p>
        )}
      </div>
    </div>
  );
}
