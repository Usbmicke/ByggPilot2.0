'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Settings, Info } from 'lucide-react';
import { useChat } from '@/app/contexts/ChatContext';
import { useUI } from '@/app/contexts/UIContext'; // STEG 4: Importera useUI

interface OnboardingChatProps {
  onComplete: () => void;
}

const SETUP_COMMAND = "*Användare har godkänt onboarding. Kör `create_google_drive_folder_structure` för att sätta upp den initiala mappstrukturen i deras Google Drive.*";

const OnboardingChat: React.FC<OnboardingChatProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useChat();
  const { openModal } = useUI(); // Hämta openModal-funktionen

  const handleSelection = async (selection: 'accept' | 'decline') => {
    if (selection === 'accept') {
      setIsLoading(true);
      try {
        console.log("User accepted, sending setup command to AI...");
        await sendMessage(SETUP_COMMAND);
        console.log("AI command sent. Opening Company Vision modal...");

        // Öppna CompanyVisionModal som nästa steg i flödet
        openModal('companyVision');

      } catch (error) {
        console.error("Ett fel uppstod under onboarding-processen:", error);
      } finally {
         // onComplete anropas nu av modalen eller när användaren stänger den,
         // för att säkerställa att ZeroState inte försvinner för tidigt.
         onComplete(); 
         setIsLoading(false); 
      }
    } else {
      console.log("User declined for now.");
      onComplete();
    }
  };

  return (
    <div className="bg-background-secondary rounded-lg shadow-xl h-full flex flex-col p-4 md:p-6 border border-border-primary">
      <div className="flex justify-between items-center border-b border-border-primary pb-4 mb-4">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Din Personliga Assistent</h2>
            <div className="flex gap-2">
                <button className="p-2 rounded-md text-text-secondary hover:bg-border-primary hover:text-text-primary transition-colors">
                    <Info size={20} />
                </button>
                 <button className="p-2 rounded-md text-text-secondary hover:bg-border-primary hover:text-text-primary transition-colors">
                    <Settings size={20} />
                </button>
            </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-lg"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-border-primary rounded-full">
                  <Bot size={40} className="text-accent-blue" />
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-3">Steg 1: Skapa din mappstruktur</h3>
            <p className="text-text-secondary mb-8">
              Låt mig starta med att automatiskt skapa en standardiserad mappstruktur i din Google Drive för kunder, projekt och dokument. Detta är grunden för all framtida automation.
            </p>

            <div className="flex justify-center gap-4">
              <motion.button
                onClick={() => handleSelection('accept')}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Skapar struktur...' : 'Ja, skapa mappstruktur'}
              </motion.button>
              <motion.button
                onClick={() => handleSelection('decline')}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-border-primary hover:bg-border-primary-hover font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Hoppa över
              </motion.button>
            </div>
             <p className="text-xs text-text-secondary/70 mt-6 max-w-sm mx-auto">
              Du kan alltid skapa denna struktur manuellt senare via inställningar.
            </p>
          </motion.div>
      </div>
    </div>
  );
};

export default OnboardingChat;
