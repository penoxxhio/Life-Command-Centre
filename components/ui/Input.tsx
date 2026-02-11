import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs text-textSecondary mb-1.5 ml-1 font-medium">{label}</label>}
      <input 
        className={`w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all outline-none ${className}`}
        {...props}
      />
    </div>
  );
};