'use client';

import React, { useState, useEffect } from 'react';
import { useUI } from '@/contexts/UIContext';
import { UserProfile } from '@/types/user';

const CompanyVisionModal: React.FC = () => {
  const { closeModal, modalPayload } = useUI();
  const [vision, setVision] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userProfile = modalPayload as UserProfile;

  useEffect(() => {
    // Ladda befintlig vision om den finns när modalen öppnas
    if (userProfile?.companyVision) {
      setVision(userProfile.companyVision);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyVision: vision }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Något gick fel.');
      }

      setSuccess(true);
      setTimeout(() => {
        closeModal();
      }, 1500); // Stäng modalen automatiskt efter en kort fördröjning

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-secondary p-6 rounded-lg shadow-xl max-w-lg w-full">
      <h2 className="text-2xl font-bold mb-4">Din Företagsvision</h2>
      <p className="text-text-secondary mb-6">
        Vad är det yttersta målet med ditt företag? (T.ex. "Bli den mest pålitliga snickaren i regionen med 100% nöjda kunder" eller "Uppnå en stabil vinst med bibehållen balans mellan arbete och fritid"). Denna vision blir min kompass.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={vision}
          onChange={(e) => setVision(e.target.value)}
          placeholder="Skriv din vision här..."
          className="w-full h-40 p-3 bg-border-primary rounded-md focus:ring-2 focus:ring-accent-blue transition-all"
          disabled={isLoading}
        />
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">Visionen har sparats!</p>}

        <div className="flex justify-end gap-4 mt-6">
          <button 
            type="button" 
            onClick={closeModal} 
            disabled={isLoading}
            className="px-4 py-2 bg-border-primary hover:bg-border-primary-hover rounded-md font-semibold transition-colors disabled:opacity-50"
          >
            Avbryt
          </button>
          <button 
            type="submit" 
            disabled={isLoading || !vision.trim()}
            className="px-6 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sparar...' : 'Spara Vision'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyVisionModal;
