'use client'; 
import React, { useState } from 'react';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGmailToCalendar = async () => {
    setMessage('');
    setIsLoading(true);
    // Simulerar ett anrop till din befintliga funktion
    setTimeout(() => {
        setMessage('Funktionen "Gmail till Kalender" är aktiverad!');
        setIsLoading(false);
    }, 1500);
  };

  const handleCreateDriveStructure = async () => {
    setMessage('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/google/create-drive-structure', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Fel: ${data.error}`);
      }
    } catch (error) {
      setMessage('Ett nätverksfel uppstod. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-white">Översikt</h2>
        <div className="flex gap-4">
           <button 
             onClick={handleGmailToCalendar} 
             disabled={isLoading}
             className="bg-brand-light hover:bg-brand-accent text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Gmail till Kalender
          </button>
          <button 
            onClick={handleCreateDriveStructure} 
            disabled={isLoading}
            className="bg-brand-light hover:bg-brand-accent text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Skapar...' : 'Skapa Mappstruktur'}
          </button>
        </div>
      </div>

      {/* Meddelandefält */}
      {message && (
        <div className="mb-6 p-4 bg-brand-medium border border-brand-light rounded-lg text-center">
          <p>{message}</p>
        </div>
      )}
      
      <h3 className="text-2xl font-semibold mb-6 text-white">Mina Projekt</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Exempel på ett projektkort */}
        <div className="bg-brand-medium p-6 rounded-xl shadow-lg border border-brand-light hover:border-brand-accent transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Villa Nygren</h3>
            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Pågående</span>
          </div>
          <p className="text-brand-accent mb-4 h-12">Renovering av badrum och kök på Södermalm.</p>
          <div className="w-full bg-brand-light rounded-full h-2.5 mb-2">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <div className="flex justify-between text-sm text-brand-accent">
            <span>Budget: 1 500 000 kr</span>
            <span>65%</span>
          </div>
        </div>

        {/* Ett till projektkort */}
        <div className="bg-brand-medium p-6 rounded-xl shadow-lg border border-brand-light hover:border-brand-accent transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">BRF Solgläntan</h3>
            <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Planering</span>
          </div>
          <p className="text-brand-accent mb-4 h-12">Stambyte och fasadrenovering för 45 lägenheter.</p>
          <div className="w-full bg-brand-light rounded-full h-2.5 mb-2">
            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
          </div>
          <div className="flex justify-between text-sm text-brand-accent">
            <span>Budget: 5 000 000 kr</span>
            <span>15%</span>
          </div>
        </div>

        {/* "Skapa nytt"-kort */}
        <div className="bg-brand-medium p-6 rounded-xl shadow-lg border-2 border-dashed border-brand-light hover:border-brand-accent transition-all duration-300 flex items-center justify-center cursor-pointer">
          <div className="text-center">
            <div className="text-4xl text-brand-accent mb-2">+</div>
            <h3 className="text-xl font-bold text-white">Nytt Projekt</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
