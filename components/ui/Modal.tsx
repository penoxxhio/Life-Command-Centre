import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      {/* Modal Container */}
      <div 
        className="relative flex flex-col w-full max-w-[400px] max-h-[90dvh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-[70]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Fixed at top */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-card/95 backdrop-blur shrink-0">
          <h2 className="text-textPrimary font-mono font-bold text-lg truncate pr-2">{title}</h2>
          <button onClick={onClose} className="text-textSecondary hover:text-white p-2 -mr-2 rounded-full hover:bg-white/5 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className={`p-4 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 min-h-0 ${footer ? '' : 'pb-6'}`}>
          {children}
        </div>

        {/* Footer - Fixed at bottom if provided */}
        {footer && (
          <div className="p-4 border-t border-border bg-card shrink-0 z-10">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
};