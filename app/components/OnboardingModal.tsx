
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface OnboardingModalProps {
  onAcknowledge: () => Promise<void>; // En funktion som körs när användaren klickar på "Fortsätt"
  userName: string; // För att kunna hälsa användaren välkommen med namn
}

export default function OnboardingModal({ onAcknowledge, userName }: OnboardingModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (isChecked) {
      setIsLoading(true);
      try {
        await onAcknowledge();
        // Om allt går bra kommer förälderkomponenten att sluta rendera denna modal.
      } catch (error) {
        console.error("Kunde inte spara användarens godkännande:", error);
        alert("Ett fel uppstod. Försök igen.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-lg w-full m-4">
        
        <h1 className="text-2xl font-bold text-white mb-3">Välkommen till ByggPilot, {userName}!</h1>
        <p className="text-gray-400 mb-6">Bara ett steg kvar innan du kan ta kontroll över din administration. Läs och godkänn våra villkor för att fortsätta.</p>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 bg-gray-900/70 p-4 rounded-md border border-gray-700">
            <input 
              id="terms-checkbox"
              type="checkbox" 
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-5 w-5 mt-1 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-sm text-gray-300">
              Jag har läst och godkänner ByggPilots <Link href="/anvandarvillkor" target="_blank" className="text-blue-400 font-semibold hover:underline">Användarvillkor</Link> och <Link href="/integritetspolicy" target="_blank" className="text-blue-400 font-semibold hover:underline">Integritetspolicy</Link>.
            </label>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleContinue}
            disabled={!isChecked || isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 disabled:hover:bg-blue-600"
          >
            {isLoading ? 'Sparar...' : 'Fortsätt till ByggPilot'}
          </button>
        </div>

      </div>
    </div>
  );
}
