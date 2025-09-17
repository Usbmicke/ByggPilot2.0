'use client';

import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingWidgetProps {
  onComplete: () => void;
}

export default function OnboardingWidget({ onComplete }: OnboardingWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(true); // Starta expanderad
    const [isLoading, setIsLoading] = useState(false);

    const handleSelection = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onComplete();
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 md:left-64 z-50 transition-all duration-500 ease-in-out ${isExpanded ? 'top-auto' : 'top-full'}`}>
            <div className="bg-gray-800/90 backdrop-blur-md shadow-2xl-top border-t border-gray-700/80 max-w-4xl mx-auto rounded-t-lg flex flex-col">
                
                {/* Header för att expandera/kollapsa */}
                <div 
                    className="flex justify-between items-center p-3 cursor-pointer" 
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <h3 className="font-bold text-white">Kom igång med ByggPilot</h3>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
                        {isExpanded ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                    </button>
                </div>

                {/* Innehållet som visas när den är expanderad */}
                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 text-center border-t border-gray-700/80">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gray-700 rounded-full">
                                    <Bot size={32} className="text-cyan-400" />
                                </div>
                            </div>

                            <h4 className="text-xl font-semibold text-white mb-2">Anslut ditt Google Drive-konto</h4>
                            <p className="text-gray-300 mb-6 max-w-prose mx-auto">
                                För att jag ska kunna hjälpa dig att automatiskt skapa, hantera och spara dina projektdokument behöver jag tillgång till Google Drive. Dina filer förblir dina.
                            </p>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleSelection}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Ansluter...' : 'Ja, koppla Google Drive'}
                                </button>
                                <button
                                    onClick={handleSelection} // Båda knapparna slutför onboardingen för nu
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Kanske senare
                                </button>
                            </div>
                             <p className="text-xs text-gray-500 mt-4 max-w-sm mx-auto">
                              Genom att ansluta godkänner du att ByggPilot kan läsa och hantera filer relaterade till dina byggprojekt.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
