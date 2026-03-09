import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'warm' | 'amber';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-sage-500 text-white hover:bg-sage-600 active:bg-sage-700 shadow-garden hover:shadow-garden-md',
  secondary:
    'bg-cream-100 text-earth-800 border border-cream-300 hover:bg-cream-200 active:bg-cream-300',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-warm',
  ghost:
    'bg-transparent text-earth-600 hover:bg-cream-100 active:bg-cream-200',
  warm:
    'bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700 shadow-warm hover:shadow-warm-md',
  amber:
    'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sunlight',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-garden',
  md: 'px-4 py-2.5 text-sm rounded-garden',
  lg: 'px-6 py-3 text-base rounded-garden-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  children,
  className = '',
  ...props
}) => {
  // Destructure out React drag handlers that conflict with framer-motion's onDrag types
  const { onDrag, onDragStart, onDragEnd, ...safeProps } = props;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...safeProps}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
};
