import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, variant = 'default', className = '', id: propId, ...props }, ref) => {
    const autoId = useId();
    const id = propId || autoId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="garden-label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`
              w-full py-3 bg-cream-50 border rounded-garden
              text-earth-900 placeholder-earth-400
              focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400
              transition-all duration-200
              ${leftIcon ? 'pl-10' : 'px-4'}
              ${rightIcon ? 'pr-10' : 'px-4'}
              ${error ? 'border-rose-400 focus:ring-rose-300 focus:border-rose-400' : 'border-cream-300'}
              ${variant === 'filled' ? 'bg-cream-100' : 'bg-cream-50'}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-rose-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-earth-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';