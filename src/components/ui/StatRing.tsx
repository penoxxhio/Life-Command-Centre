import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type RingColor = 'neon' | 'purple' | 'amber' | 'red' | 'green' | 'blue';

interface StatRingProps {
  value: number;        // 0-100
  max?: number;
  color?: RingColor;
  size?: number;        // px
  strokeWidth?: number;
  label?: string;
  icon?: ReactNode;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const ringColors: Record<RingColor, { stroke: string; glow: string }> = {
  neon: { stroke: '#00d4ff', glow: 'drop-shadow(0 0 6px rgba(0,212,255,0.5))' },
  purple: { stroke: '#8626ff', glow: 'drop-shadow(0 0 6px rgba(112,0,255,0.5))' },
  amber: { stroke: '#ffc000', glow: 'drop-shadow(0 0 6px rgba(255,192,0,0.5))' },
  red: { stroke: '#ff4d6a', glow: 'drop-shadow(0 0 6px rgba(255,77,106,0.5))' },
  green: { stroke: '#10b981', glow: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' },
  blue: { stroke: '#4d9fff', glow: 'drop-shadow(0 0 6px rgba(77,159,255,0.5))' },
};

export function StatRing({
  value,
  max = 100,
  color = 'neon',
  size = 80,
  strokeWidth = 6,
  label,
  icon,
  showValue = true,
  animated = true,
  className = '',
}: StatRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;
  const { stroke, glow } = ringColors[color];

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="stat-ring"
          style={{ filter: glow }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Value ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={animated ? { strokeDashoffset: circumference } : undefined}
            animate={{ strokeDashoffset: offset }}
            transition={animated ? { duration: 1, ease: 'easeOut', delay: 0.2 } : { duration: 0 }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <span className="text-void-200">{icon}</span>}
          {showValue && !icon && (
            <span
              className="font-mono font-semibold text-void-100"
              style={{ fontSize: size * 0.22 }}
            >
              {Math.round(pct)}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-medium text-void-400 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
