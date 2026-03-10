import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon' | 'purple' | 'amber';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-neon-500/20 border-neon-500/30 text-neon-300 hover:bg-neon-500/30 hover:border-neon-500/50 hover:shadow-neon',
  secondary: 'bg-white/[0.04] border-white/[0.08] text-void-200 hover:bg-white/[0.08] hover:border-white/[0.12]',
  ghost: 'bg-transparent border-transparent text-void-300 hover:bg-white/[0.04] hover:text-void-100',
  danger: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40',
  neon: 'bg-neon-500/10 border-neon-400/20 text-neon-400 hover:bg-neon-500/20 hover:shadow-neon',
  purple: 'bg-nebula-500/10 border-nebula-400/20 text-nebula-300 hover:bg-nebula-500/20 hover:shadow-neon-purple',
  amber: 'bg-ember-500/10 border-ember-400/20 text-ember-400 hover:bg-ember-500/20 hover:shadow-neon-amber',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-glass',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-glass',
};

export function GlassButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: GlassButtonProps) {
  return (
    <motion.button
      className={`
        inline-flex items-center justify-center font-medium
        border backdrop-blur-sm transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  );
}
