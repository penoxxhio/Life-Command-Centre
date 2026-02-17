
import React, { useState, useEffect } from 'react';
import { Home, Banknote, Activity, Utensils, Settings, Sparkles } from 'lucide-react';
import { Tab, UserProfile } from '../types';
import { getAiUsage, UsageStats, isAiReady } from '../services/geminiService';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  userProfile: UserProfile;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, userProfile }) => {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkUsage = () => {
      setUsage(getAiUsage());
      setIsReady(isAiReady());
    };
    checkUsage();
    const interval = setInterval(checkUsage, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  const tabs = [
    { id: Tab.HOME, label: 'Home', icon: Home },
    { id: Tab.MONEY, label: 'Money', icon: Banknote },
    { id: Tab.FITNESS, label: 'Fitness', icon: Activity },
    { id: Tab.NUTRITION, label: 'Food', icon: Utensils },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  
  // Calculate week number
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDays = (today.getTime() - startOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);

  return (
    <div className="min-h-screen bg-background text-textPrimary font-sans selection:bg-accent/30">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col relative bg-background shadow-2xl">
        
        {/* Header - Sticky with Blur */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 px-5 py-4 flex justify-between items-center h-[70px]">
          <div className="flex-1">
            <div className="text-textSecondary font-mono text-[10px] uppercase tracking-widest mb-0.5">
              {dateString} • WK {weekNum}
            </div>
            <h1 className="text-lg font-bold text-textPrimary tracking-tight">
              {getGreeting()}, <span className="text-accent">{userProfile.name}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isReady && usage && (
              <div className="flex flex-col items-end mr-1">
                <div className="flex items-center gap-1.5 text-ai text-[10px] font-mono font-bold">
                  <Sparkles size={12} className={usage.isRateLimited ? 'text-alert' : 'text-ai'} />
                  <span>{Math.max(0, usage.quotaLimit - usage.todayCount)} LEFT</span>
                </div>
                <div className="w-12 h-1 bg-border rounded-full overflow-hidden mt-1">
                   <div 
                    className={`h-full transition-all duration-500 ${usage.isRateLimited ? 'bg-alert' : 'bg-ai'}`}
                    style={{ width: `${(usage.todayCount / usage.quotaLimit) * 100}%` }}
                   />
                </div>
              </div>
            )}
            <button 
              onClick={() => onTabChange(Tab.SETTINGS)}
              className="p-2.5 text-textSecondary hover:text-white hover:bg-card rounded-full transition-all active:scale-95"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-28 animate-fade-in">
          {children}
        </main>

        {/* Bottom Navigation - Floating Effect */}
        <nav className="fixed bottom-0 z-40 w-full max-w-[430px] px-4 pb-6 pt-2 pointer-events-none">
          <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl pointer-events-auto flex justify-between items-center px-6 h-[70px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center w-12 h-full space-y-1.5 transition-all duration-300 relative group ${
                    isActive ? 'text-accent' : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  <div className={`absolute -top-3 w-8 h-1 bg-accent rounded-b-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className={`text-[9px] font-mono font-bold uppercase transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </div>
  );
};
