
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
      className={`bg-card border border-border/60 rounded-xl p-5 mb-4 shadow-sm relative overflow-hidden transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-border hover:bg-card/80 active:scale-[0.99]' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-textSecondary font-mono uppercase text-[10px] tracking-widest font-bold">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
