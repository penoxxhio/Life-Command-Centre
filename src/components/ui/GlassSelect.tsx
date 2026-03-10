import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-void-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full appearance-none
              bg-white/[0.03] border border-white/[0.08] rounded-glass
              px-4 py-2.5 pr-10 text-sm text-void-100
              backdrop-blur-sm
              focus:outline-none focus:border-neon-500/40 focus:bg-white/[0.05]
              focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]
              transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              ${error ? 'border-red-500/40' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-void-900 text-void-400">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-void-900 text-void-100">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-void-400 pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
