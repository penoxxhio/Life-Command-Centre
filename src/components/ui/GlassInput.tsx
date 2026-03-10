import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, hint, icon, suffix, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-void-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-void-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-white/[0.03] border border-white/[0.08] rounded-glass
              px-4 py-2.5 text-sm text-void-100 placeholder:text-void-500
              backdrop-blur-sm
              focus:outline-none focus:border-neon-500/40 focus:bg-white/[0.05]
              focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]
              transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${suffix ? 'pr-10' : ''}
              ${error ? 'border-red-500/40 focus:border-red-500/60' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-void-400 text-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-void-500">{hint}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
