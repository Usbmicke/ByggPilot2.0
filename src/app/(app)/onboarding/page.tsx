'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { createGoogleDriveStructure } from '@/lib/genkit/flows'; // Importera vår nya klient-funktion

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDriveStructure = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Initierar skapande av Google Drive-mappstruktur...");
      const result = await createGoogleDriveStructure({}); // Anropa flödet

      if (result.success) {
        console.log("Mappstruktur skapad! Meddelande:", result.message);
        alert("Mappstrukturen har skapats i din Google Drive! Omdirigerar till dashboarden.");
        router.push('/dashboard'); // Omdirigera till den riktiga dashboarden
      } else {
        throw new Error(result.message);
      }

    } catch (err: any) {
      console.error("Fel vid skapande av mappstruktur:", err);
      setError(err.message || "Ett oväntat fel uppstod.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Välkommen till ByggPilot!</h1>
        <p className="text-lg text-neutral-300 mb-8">
          Ett klick för att organisera din digitala arbetsplats. Vi skapar en standardiserad mappstruktur i din Google Drive, så att du alltid hittar rätt.
        </p>
        <Button onClick={handleCreateDriveStructure} disabled={isLoading}>
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
