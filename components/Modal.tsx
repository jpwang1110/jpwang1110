import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth = 'max-w-6xl' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-white/90 backdrop-blur-sm p-4 transition-all duration-300">
      {/* Overlay background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[95vh]`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;