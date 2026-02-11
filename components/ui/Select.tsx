import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-textSecondary mb-1.5 ml-1 font-medium">{label}</label>}
      <div className="relative">
        <select 
          className={`w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-textPrimary appearance-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all outline-none ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textSecondary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  );
};