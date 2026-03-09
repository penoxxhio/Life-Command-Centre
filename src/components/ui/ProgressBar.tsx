import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'sage' | 'terracotta' | 'amber' | 'rose' | 'leaf';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const variantGradients: Record<string, string> = {
  sage: 'bg-gradient-to-r from-sage-400 to-sage-500',
  terracotta: 'bg-gradient-to-r from-terracotta-400 to-terracotta-500',
  amber: 'bg-gradient-to-r from-amber-400 to-amber-500',
  rose: 'bg-gradient-to-r from-rose-400 to-rose-500',
  leaf: 'bg-gradient-to-r from-leaf-400 to-leaf-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'sage',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-earth-700">{label}</span>}
          {showLabel && <span className="text-sm text-earth-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full rounded-full bg-cream-200 overflow-hidden ${sizeStyles[size]}`}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${variantGradients[variant]}`}
        />
      </div>
    </div>
  );
};
