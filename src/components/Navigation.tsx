import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Wallet, Dumbbell, Utensils, Settings, Egg } from 'lucide-react';
import type { ReactNode } from 'react';

interface NavItemConfig {
  path: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItemConfig[] = [
  { path: '/', label: 'Home', icon: <Home size={20} /> },
  { path: '/creature', label: 'Creature', icon: <Egg size={20} /> },
  { path: '/money', label: 'Money', icon: <Wallet size={20} /> },
  { path: '/fitness', label: 'Fitness', icon: <Dumbbell size={20} /> },
  { path: '/nutrition', label: 'Food', icon: <Utensils size={20} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Glass bar */}
      <div className="mx-auto max-w-lg px-2 pb-safe">
        <div
          className="
            flex items-center justify-around
            bg-void-950/80 border border-white/[0.06] 
            backdrop-blur-[20px] rounded-t-glass-lg
            px-1 py-1
            shadow-[0_-4px_30px_rgba(0,0,0,0.3)]
          "
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-2 px-3 rounded-glass transition-colors"
              >
                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-glass bg-neon-500/[0.08] border border-neon-500/[0.15]"
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-neon-400' : 'text-void-500 hover:text-void-300'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 text-[9px] font-medium mt-0.5 tracking-wide uppercase transition-colors duration-200 ${
                    isActive ? 'text-neon-400' : 'text-void-600'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
