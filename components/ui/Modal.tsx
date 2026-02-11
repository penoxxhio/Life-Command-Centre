import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border w-full max-w-[400px] rounded-lg shadow-xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header - Fixed at top */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-card shrink-0 rounded-t-lg">
          <h2 className="text-textPrimary font-mono font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-textSecondary hover:text-white p-1">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {children}
        </div>

      </div>
    </div>
  );
};