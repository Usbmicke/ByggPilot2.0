
import React from 'react';
import { IconX } from '../../constants';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showWeather: boolean;
    setShowWeather: (show: boolean) => void;
    showTodo: boolean;
    setShowTodo: (show: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    showWeather, 
    setShowWeather,
    showTodo,
    setShowTodo
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-fast"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <IconX className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Inställningar</h2>
                
                <div className="space-y-4 border-t border-b border-gray-700 py-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Visningsalternativ</h3>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">Visa Väder-widget på projektkort</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={showWeather} onChange={() => setShowWeather(!showWeather)} />
                            <div className={`block w-14 h-8 rounded-full transition ${showWeather ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showWeather ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                    </label>
                     <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">Visa "Att Göra"-widget (Google Tasks)</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={showTodo} onChange={() => setShowTodo(!showTodo)} />
                            <div className={`block w-14 h-8 rounded-full transition ${showTodo ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showTodo ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                    </label>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-200">Kommande integrationer</h3>
                     <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
                            <p className="font-bold text-gray-300">Fortnox</p>
                        </div>
                         <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
                            <p className="font-bold text-gray-300">Visma</p>
                        </div>
                     </div>
                </div>
                 <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-cyan-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
