import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'glass' | 'warm' | 'sage' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white border border-cream-200/60 shadow-garden',
  glass: 'bg-white/70 backdrop-blur-md border border-white/40 shadow-garden',
  warm: 'bg-gradient-to-br from-cream-50 to-terracotta-50 border border-terracotta-100 shadow-warm',
  sage: 'bg-gradient-to-br from-sage-50 to-cream-50 border border-sage-100 shadow-garden',
  flat: 'bg-cream-50 border border-cream-200',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  variant = 'default',
  padding = 'md',
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={`
        rounded-garden-lg transition-all duration-200
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${interactive ? 'cursor-pointer hover:shadow-garden-md active:scale-[0.98]' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className={`flex items-center justify-between ${padding === 'none' ? 'px-4 pt-4' : 'mb-3'}`}>
          <div>
            {title && <h3 className="font-display font-bold text-earth-900">{title}</h3>}
            {subtitle && <p className="text-sm text-earth-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
};
