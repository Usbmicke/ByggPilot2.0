'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Settings, Info } from 'lucide-react';

interface OnboardingChatProps {
  onComplete: () => void;
}

const OnboardingChat: React.FC<OnboardingChatProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelection = async (selection: 'accept' | 'decline') => {
    setIsLoading(true);
    console.log(`User selected: ${selection}`);
    
    // Simulera en kort fördröjning, t.ex. för ett API-anrop
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Anropa onComplete för att uppdatera status i databasen
    // och trigga en omdirigering/vy-ändring i layout-komponenten.
    onComplete();

    // Not: isLoading behöver inte sättas till false eftersom komponenten kommer att avmonteras.
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl h-full flex flex-col p-4 md:p-6">
      {/* Header med plats för flikar och inställningar */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Din Personliga Assistent</h2>
            <div className="flex gap-2">
                <button className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <Info size={20} />
                </button>
                 <button className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* Huvudinnehåll för chatten */}
      <div className="flex-grow flex flex-col justify-center items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-lg"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-700 rounded-full">
                  <Bot size={40} className="text-cyan-400" />
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-3">Kom igång med ByggPilot</h3>
            <p className="text-gray-300 mb-8">
              För att ge dig den bästa hjälpen och automatisera dina dokument, behöver jag tillgång till ditt Google Drive-konto. Vill du koppla det nu?
            </p>

            <div className="flex justify-center gap-4">
              <motion.button
                onClick={() => handleSelection('accept')}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Ansluter...' : 'Ja, koppla Google Drive'}
              </motion.button>
              <motion.button
                onClick={() => handleSelection('decline')}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Kanske senare
              </motion.button>
            </div>
             <p className="text-xs text-gray-500 mt-6 max-w-sm mx-auto">
              Genom att ansluta godkänner du att ByggPilot kan läsa och hantera filer relaterade till dina byggprojekt.
            </p>
          </motion.div>
      </div>
    </div>
  );
};

export default OnboardingChat;
