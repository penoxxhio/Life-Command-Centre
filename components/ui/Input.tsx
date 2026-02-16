import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full min-w-0">
      {label && <label className="block text-xs text-textSecondary mb-1.5 ml-1 font-medium">{label}</label>}
      <input 
        className={`w-full bg-background/50 border border-border rounded-lg px-3 py-2.5 text-base text-textPrimary placeholder:text-textMuted focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all outline-none appearance-none min-w-0 ${className}`}
        style={{ colorScheme: 'dark' }} // Forces dark date picker on supported browsers
        {...props}
      />
    </div>
  );
};