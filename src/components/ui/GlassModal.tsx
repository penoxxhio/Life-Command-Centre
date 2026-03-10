import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function GlassModal({ isOpen, onClose, title, subtitle, children, size = 'md' }: GlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className={`
                pointer-events-auto w-full ${sizeStyles[size]}
                bg-void-900/90 border border-white/[0.08] rounded-glass-lg
                backdrop-blur-[24px] shadow-glass
                overflow-hidden
              `}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            >
              {/* Header */}
              {(title || subtitle) && (
                <div className="flex items-start justify-between p-5 pb-0">
                  <div>
                    {title && <h2 className="font-display text-lg font-semibold text-void-100">{title}</h2>}
                    {subtitle && <p className="text-sm text-void-400 mt-0.5">{subtitle}</p>}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-void-400 hover:text-void-200 hover:bg-white/[0.05] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {/* Body */}
              <div className="p-5">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
