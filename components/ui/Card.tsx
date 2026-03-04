import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, title, action }) => {
  return (
    <div 
      className={`bg-card border border-border rounded-xl p-4 mb-4 shadow-sm ${onClick ? 'cursor-pointer active:opacity-90 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-3">
          {title && <h3 className="text-textSecondary font-mono uppercase text-[11px] tracking-wider">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
