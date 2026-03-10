import { motion } from 'framer-motion';

type ProgressColor = 'neon' | 'purple' | 'amber' | 'red' | 'green' | 'white';

interface GlassProgressProps {
  value: number;       // 0-100
  max?: number;
  color?: ProgressColor;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const colorStyles: Record<ProgressColor, { bar: string; glow: string }> = {
  neon: { bar: 'bg-neon-500', glow: 'shadow-[0_0_12px_rgba(0,212,255,0.4)]' },
  purple: { bar: 'bg-nebula-400', glow: 'shadow-[0_0_12px_rgba(112,0,255,0.4)]' },
  amber: { bar: 'bg-ember-500', glow: 'shadow-[0_0_12px_rgba(255,192,0,0.4)]' },
  red: { bar: 'bg-hp', glow: 'shadow-[0_0_12px_rgba(255,77,106,0.4)]' },
  green: { bar: 'bg-emerald-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
  white: { bar: 'bg-white/60', glow: '' },
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function GlassProgress({
  value,
  max = 100,
  color = 'neon',
  size = 'md',
  label,
  showValue = false,
  animated = true,
  className = '',
}: GlassProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-medium text-void-300">{label}</span>}
          {showValue && (
            <span className="text-xs font-mono text-void-400">
              {value}{max !== 100 ? `/${max}` : '%'}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-white/[0.05] rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <motion.div
          className={`h-full rounded-full ${colorStyles[color].bar} ${colorStyles[color].glow}`}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${pct}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
        />
      </div>
    </div>
  );
}
