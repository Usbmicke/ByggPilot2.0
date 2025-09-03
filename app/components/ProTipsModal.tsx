"use client";

import { X } from 'lucide-react';

interface ProTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProTipsModal: React.FC<ProTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="relative bg-gray-900 border border-cyan-400 rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col text-white">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-cyan-400">Vässa ditt företag – Tips för proffs</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full bg-gray-800 hover:bg-gray-700"
            aria-label="Stäng fönster"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto">
          <p>Här kommer vi att lägga till innehållet för proffstipsen...</p>
        </div>
        
      </div>
    </div>
  );
};

export default ProTipsModal;
