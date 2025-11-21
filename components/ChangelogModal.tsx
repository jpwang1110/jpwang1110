import React from 'react';
import Modal from './Modal';
import { CloseIcon } from './Icons';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">開發歷程 Changelog</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="pl-2">
          <div className="border-l-2 border-slate-200 pl-4 pb-6 relative">
            <div className="w-3 h-3 bg-[#5B9BD5] rounded-full absolute -left-[7px] top-1.5 ring-4 ring-white"></div>
            <div className="text-sm font-bold text-[#5B9BD5] mb-1">V7.3 (Current)</div>
            <div className="text-xs text-slate-500 leading-relaxed">Refactored to React + TypeScript + Tailwind. Optimized responsiveness and exchange rate data fetching.</div>
          </div>
          <div className="border-l-2 border-slate-200 pl-4 pb-6 relative">
            <div className="w-3 h-3 bg-slate-300 rounded-full absolute -left-[7px] top-1.5 ring-4 ring-white"></div>
            <div className="text-sm font-bold text-slate-500 mb-1">V7.0-7.2</div>
            <div className="text-xs text-slate-500 leading-relaxed">Added currency swap, weight units, and total estimates.</div>
          </div>
          <div className="border-l-2 border-slate-200 pl-4 pb-6 relative">
             <div className="w-3 h-3 bg-slate-300 rounded-full absolute -left-[7px] top-1.5 ring-4 ring-white"></div>
             <div className="text-sm font-bold text-slate-500 mb-1">V6.x</div>
             <div className="text-xs text-slate-500 leading-relaxed">UI Overhaul, copyright footer.</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChangelogModal;