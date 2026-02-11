import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
  segmented?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  max, 
  color = '#4A9E8E', 
  className = '',
  segmented = false
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`h-2 bg-border rounded-full overflow-hidden w-full ${className} relative`}>
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
      {segmented && (
        <div className="absolute inset-0 flex justify-evenly">
          {[...Array(9)].map((_, i) => (
             <div key={i} className="w-[1px] h-full bg-background/30" />
          ))}
        </div>
      )}
    </div>
  );
};
