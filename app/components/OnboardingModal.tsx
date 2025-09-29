
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface OnboardingModalProps {
  onAcknowledge: () => Promise<void>;
  userName: string;
}

export default function OnboardingModal({ onAcknowledge, userName }: OnboardingModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (isChecked) {
      setIsLoading(true);
      try {
        await onAcknowledge();
      } catch (error) {
        console.error("Kunde inte spara användarens godkännande:", error);
        alert("Ett fel uppstod. Försök igen.");
        setIsLoading(false);
      }
    }
  };

  return (
    // Denna div skapar overlayen och blurrar bakgrunden
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-xl w-full m-4">
        
        <h1 className="text-2xl font-bold text-white mb-3">En sista, viktig detalj, {userName}.</h1>
        <p className="text-gray-300 mb-6 text-base">
          För att fungera som din proaktiva digitala kollega behöver ByggPilot tillåtelse att skapa och hantera en dedikerad mapp på din Google Drive. Allt vi skapar åt dig – offerter, checklistor och projektdokument – sparas automatiskt där.
        </p>

        <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-white">Full Transparens & Kontroll</h2>
            <p className="text-gray-400 text-sm mt-1">
                Vi har <b className="text-cyan-300">endast</b> åtkomst till den specifika mappen vi skapar, som heter <code className="bg-gray-700 text-cyan-300 px-1 py-0.5 rounded">ByggPilot - [Ditt Företagsnamn]</code>, och absolut inget annat. Detta godkännande är kärnan i hur vi eliminerar ditt pappersarbete.
            </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input 
              id="terms-checkbox"
              type="checkbox" 
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-5 w-5 mt-0.5 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="terms-checkbox" className="text-sm text-gray-300">
              Jag förstår och godkänner att ByggPilot skapar och hanterar en mapp på min Google Drive. Jag har även läst och accepterar <Link href="/anvandarvillkor" target="_blank" className="text-cyan-400 font-semibold hover:underline">Användarvillkoren</Link> och <Link href="/integritetspolicy" target="_blank" className="text-cyan-400 font-semibold hover:underline">Integritetspolicyn</Link>.
            </label>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleContinue}
            disabled={!isChecked || isLoading}
            className="w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-500 disabled:hover:bg-cyan-600 focus:ring-4 focus:ring-cyan-500/50"
          >
            {isLoading ? 'Verifierar...' : 'Godkänn och fortsätt'}
          </button>
        </div>

      </div>
    </div>
  );
}
