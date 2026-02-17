
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "h-[44px] min-h-[44px] px-4 rounded font-mono text-sm font-bold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-opacity-90 shadow-lg shadow-accent/10",
    secondary: "bg-border text-textPrimary hover:bg-opacity-80",
    danger: "bg-alert text-white hover:bg-opacity-90",
    ghost: "bg-transparent text-textSecondary hover:text-textPrimary border border-border"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
