import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-leaf-500" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500" />,
  info: <Info className="w-5 h-5 text-sky-500" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'bg-leaf-50 border-leaf-200',
  error: 'bg-rose-50 border-rose-200',
  info: 'bg-sky-50 border-sky-200',
  warning: 'bg-amber-50 border-amber-200',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-garden-lg border shadow-garden-md
        ${bgMap[toast.type]}
      `}
    >
      {iconMap[toast.type]}
      <p className="flex-1 text-sm font-medium text-earth-800">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-garden text-earth-400 hover:text-earth-600 hover:bg-white/50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export type { ToastData };