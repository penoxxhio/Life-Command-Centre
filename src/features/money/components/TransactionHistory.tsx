import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EXPENSE_CATEGORIES } from '@/constants';

const getCategoryEmoji = (key: string) => EXPENSE_CATEGORIES.find((c) => c.name === key)?.emoji ?? '\u{1F4E6}';

export const TransactionHistory: React.FC = () => {
  const { data } = useAppStore();
  const money = data.money;
  const [search, setSearch] = useState('');
  const currency = money.currency ?? 'AED';
  const transactions = money.transactions ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sorted = [...transactions].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (!q) return sorted;
    return sorted.filter((t: any) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }, [transactions, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((t: any) => {
      const dateKey = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
      {filtered.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-earth-500">No transactions yet</p></Card>
      ) : (
        Object.entries(grouped).map(([date, txns]) => (
          <div key={date}>
            <p className="text-xs font-medium text-earth-400 uppercase tracking-wide mb-2">{date}</p>
            <div className="space-y-1.5">
              <AnimatePresence>
                {txns.map((t: any) => (
                  <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Card className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">{getCategoryEmoji(t.category)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-earth-900 truncate">{t.description}</p>
                          <p className="text-xs text-earth-400 capitalize">{t.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {t.type === 'expense' ? <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" /> : <ArrowUpRight className="w-3.5 h-3.5 text-sage-500" />}
                          <span className={`text-sm font-bold ${t.type === 'expense' ? 'text-rose-600' : 'text-sage-600'}`}>{currency} {t.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
