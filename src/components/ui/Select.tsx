import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id: propId, ...props }, ref) => {
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
          <select
            ref={ref}
            id={id}
            className={`
              w-full py-3 pl-4 pr-10 bg-cream-50 border rounded-garden
              text-earth-900 appearance-none
              focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400
              transition-all duration-200
              ${error ? 'border-rose-400' : 'border-cream-300'}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-sm text-rose-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
