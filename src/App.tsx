import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/Layout';
import { ToastContainer } from '@/components/ui';
import { SetupWizard } from '@/components/SetupWizard';
import { HomePage } from '@/features/home/HomePage';
import { MoneyPage } from '@/features/money/MoneyPage';
import { GardenPage } from '@/features/garden/GardenPage';
import { FitnessPage } from '@/features/fitness/FitnessPage';
import { NutritionPage } from '@/features/nutrition/NutritionPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { initNotifications } from '@/services/notificationService';

export const App: React.FC = () => {
  const location = useLocation();
  const { data, loadData, applyGardenDecay, toasts, dismissToast } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyGardenDecay();
  }, [applyGardenDecay]);

  useEffect(() => {
    if (data.notifications.enabled) {
      initNotifications(data.notifications);
    }
  }, [data.notifications]);

  if (!data.profile.setupComplete) {
    return (
      <>
        <SetupWizard />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/money" element={<MoneyPage />} />
            <Route path="/garden" element={<GardenPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/nutrition" element={<NutritionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};
