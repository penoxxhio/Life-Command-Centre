import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type GlassVariant = 'default' | 'heavy' | 'neon' | 'purple' | 'amber' | 'ghost';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: GlassVariant;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<GlassVariant, string> = {
  default: 'bg-white/[0.03] border-white/[0.06]',
  heavy: 'bg-white/[0.05] border-white/[0.08]',
  neon: 'bg-neon-500/[0.05] border-neon-500/[0.15]',
  purple: 'bg-nebula-500/[0.05] border-nebula-500/[0.15]',
  amber: 'bg-ember-500/[0.05] border-ember-500/[0.15]',
  ghost: 'bg-transparent border-transparent',
};

const glowStyles: Record<GlassVariant, string> = {
  default: '',
  heavy: '',
  neon: 'shadow-neon',
  purple: 'shadow-neon-purple',
  amber: 'shadow-neon-amber',
  ghost: '',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', hover = false, glow = false, padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`
          rounded-glass border backdrop-blur-[16px]
          ${variantStyles[variant]}
          ${glow ? glowStyles[variant] : ''}
          ${hover ? 'transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.1] hover:shadow-glass-hover cursor-pointer' : ''}
          ${paddingStyles[padding]}
          ${className}
        `}
        whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
        whileTap={hover ? { scale: 0.995 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
