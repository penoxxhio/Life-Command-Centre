import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { Navigation } from './components/Navigation';
import { SetupWizard } from './components/SetupWizard';
import { ToastContainer } from './components/ui';
import { HomePage } from './features/home/HomePage';
import { MoneyPage } from './features/money/MoneyPage';
import { FitnessPage } from './features/fitness/FitnessPage';
import { NutritionPage } from './features/nutrition/NutritionPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { CreaturePage } from './features/creature/CreaturePage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/creature" element={<PageWrapper><CreaturePage /></PageWrapper>} />
        <Route path="/money" element={<PageWrapper><MoneyPage /></PageWrapper>} />
        <Route path="/fitness" element={<PageWrapper><FitnessPage /></PageWrapper>} />
        <Route path="/nutrition" element={<PageWrapper><NutritionPage /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const data = useAppStore((s) => s.data);
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const tickCreature = useAppStore((s) => s.tickCreature);
  const loadData = useAppStore((s) => s.loadData);

  // Load data and apply creature decay on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tick creature stats every 5 minutes
  useEffect(() => {
    if (!data.profile.setupComplete) return;
    const interval = setInterval(tickCreature, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [data.profile.setupComplete, tickCreature]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      if (toasts.length > 0) dismissToast(toasts[0].id);
    }, toasts[0]?.duration || 4000);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  // Show setup wizard if not completed
  if (!data.profile.setupComplete) {
    return (
      <>
        <SetupWizard />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <AnimatedRoutes />
        <Navigation />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </BrowserRouter>
  );
}
