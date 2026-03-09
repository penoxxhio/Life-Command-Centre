import React from 'react';

interface BadgeProps {
  variant?: 'sage' | 'terracotta' | 'amber' | 'rose' | 'earth' | 'leaf';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  sage: 'bg-sage-100 text-sage-700 border-sage-200',
  terracotta: 'bg-terracotta-100 text-terracotta-700 border-terracotta-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  earth: 'bg-earth-100 text-earth-600 border-earth-200',
  leaf: 'bg-leaf-100 text-leaf-700 border-leaf-200',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'sage',
  size = 'sm',
  children,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
