import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { ToastItem } from '../../types';

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastItem['type'], { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: <CheckCircle size={16} className="text-emerald-400" />,
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: <AlertCircle size={16} className="text-red-400" />,
  },
  info: {
    bg: 'bg-neon-500/10',
    border: 'border-neon-500/20',
    icon: <Info size={16} className="text-neon-400" />,
  },
  xp: {
    bg: 'bg-ember-500/10',
    border: 'border-ember-500/20',
    icon: <Sparkles size={16} className="text-ember-400" />,
  },
};

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              className={`
                pointer-events-auto
                flex items-center gap-3 px-4 py-3
                ${style.bg} border ${style.border}
                rounded-glass backdrop-blur-[16px]
                shadow-glass
              `}
            >
              <span className="shrink-0">{style.icon}</span>
              <p className="text-sm text-void-100 flex-1">{toast.message}</p>
              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 rounded-lg text-void-400 hover:text-void-200 hover:bg-white/[0.05] transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
