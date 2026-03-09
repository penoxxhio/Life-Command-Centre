import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Wallet,
  Flower2,
  Dumbbell,
  UtensilsCrossed,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getAiUsage, isAiReady } from '@/services/geminiService';
import { getStreak } from '@/services/streakService';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/money', label: 'Money', icon: Wallet },
  { path: '/garden', label: 'Garden', icon: Flower2 },
  { path: '/fitness', label: 'Fitness', icon: Dumbbell },
  { path: '/nutrition', label: 'Food', icon: UtensilsCrossed },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useAppStore();
  const streak = getStreak();
  const aiUsage = isAiReady() ? getAiUsage() : null;

  return (
    <div className="min-h-[100dvh] bg-garden-gradient flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 safe-top">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-garden bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-garden">
              <Flower2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-display font-bold text-earth-900 leading-tight">
                {data.profile.name ? `${data.profile.name}'s Garden` : 'Life Centre'}
              </h1>
              {streak.currentStreak > 0 && (
                <p className="text-xs text-sage-600 leading-tight">
                  {streak.currentStreak} day streak
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiUsage && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-garden bg-cream-100/80 border border-cream-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-earth-600">
                  {aiUsage.remaining}
                </span>
              </div>
            )}
            <button
              onClick={() => navigate('/settings')}
              className={`p-2 rounded-garden transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-sage-100 text-sage-700'
                  : 'text-earth-500 hover:text-earth-700 hover:bg-cream-100'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="max-w-lg mx-auto bg-white/90 backdrop-blur-lg border-t border-cream-200 shadow-garden-lg">
          <div className="flex items-center justify-around px-2 py-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-0"
                >
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -inset-2 bg-sage-100 rounded-garden-lg"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`relative w-5 h-5 transition-colors duration-200 ${
                        isActive ? 'text-sage-600' : 'text-earth-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-colors duration-200 ${
                      isActive ? 'text-sage-700' : 'text-earth-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};
