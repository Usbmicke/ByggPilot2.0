'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { createGoogleDriveStructure } from '@/lib/genkit/flows';

export default function OnboardingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(''); // State för företagsnamn
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDriveStructure = async () => {
    if (!companyName.trim()) {
      setError('Vänligen ange ett företagsnamn.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      console.log("Initierar skapande av Google Drive-mappstruktur...");
      // Skicka med companyName i payloaden
      const result = await createGoogleDriveStructure({ companyName });

      if (result.success) {
        console.log("Mappstruktur skapad! Meddelande:", result.message);
        alert("Mappstrukturen har skapats i din Google Drive! Omdirigerar till dashboarden.");
        router.push('/dashboard');
      } else {
        throw new Error(result.message || 'Ett okänt fel inträffade på servern.');
      }

    } catch (err: any) {
      console.error("Fel vid skapande av mappstruktur:", err);
      setError(err.message || "Ett oväntat fel uppstod.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Välkommen till ByggPilot!</h1>
        <p className="text-lg text-neutral-300 mb-8">
          Ett klick för att organisera din digitala arbetsplats. Börja med att ange ditt företagsnamn för att skapa en personlig mappstruktur i din Google Drive.
        </p>

        {/* Input fält för Företagsnamn */}
        <div className="mb-8">
          <label htmlFor="companyName" className="sr-only">Företagsnamn</label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ange ditt företagsnamn här"
            className="w-full max-w-md mx-auto bg-neutral-800 border border-neutral-600 text-white placeholder-neutral-400 text-center p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <Button onClick={handleCreateDriveStructure} disabled={isLoading || !companyName.trim()}>
          {isLoading ? 'Skapar struktur...' : 'Skapa Mappstruktur i Google Drive'}
        </Button>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        <button 
          onClick={() => router.push('/dashboard')} 
          className="mt-8 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Hoppa över för nu
        </button>
      </div>
    </div>
  );
}
