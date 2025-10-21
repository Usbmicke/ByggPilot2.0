'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { completeOnboarding } from '@/actions/userActions';

// =================================================================================
// SUCCESS-STEG V2.0 - PLATINUM STANDARD (SESSIONSSYNKRONISERING)
//
// REVIDERING: Komponenten använder nu `update`-funktionen från `useSession`.
// Detta är den enda arkitektoniskt korrekta metoden för att säkerställa att
// sessionen (JWT) uppdateras INNAN klienten omdirigeras. Detta eliminerar
// race conditions med middleware och garanterar en sömlös övergång till dashboard.
// =================================================================================

interface StepSuccessProps {
  companyName: string | null;
  folderUrl: string | null;
}

const Step_Success: React.FC<StepSuccessProps> = ({ companyName, folderUrl }) => {
  const router = useRouter();
  const { data: session, update } = useSession(); // Hämta update-funktionen

  const displayName = companyName || 'ditt företag';

  const handleComplete = async () => {
    if (!session?.user?.id) {
      console.error('Kunde inte slutföra onboarding: Användar-ID saknas.');
      return;
    }

    try {
      // 1. Uppdatera databasen via Server Action
      await completeOnboarding(session.user.id);

      // 2. Tvinga en uppdatering av session-token
      await update({ onboardingComplete: true });

      // 3. Omdirigera först EFTER att sessionen är uppdaterad
      router.push('/dashboard?tour=true');

    } catch (error) {
      console.error('Ett fel uppstod vid slutförande av onboarding:', error);
      // Här kan du visa ett felmeddelande för användaren
    }
  };

  return (
    <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-center animate-fade-in">
      
      <div className="mb-5 flex justify-center">
        <CheckCircle2 className="w-16 h-16 text-green-400" />
      </div>

      <h2 className="text-3xl font-bold text-white">Allt är klart!</h2>
      <p className="text-gray-300 mt-4 max-w-lg mx-auto">
        Din projektmapp <code className="bg-gray-700 text-cyan-300 px-2 py-1 rounded">ByggPilot - {displayName}</code> har skapats i din Google Drive.
      </p>

      {folderUrl && (
        <div className="mt-6">
          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 justify-center bg-gray-700/80 hover:bg-gray-700 border border-gray-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            Öppna mappen i Google Drive
          </a>
        </div>
      )}

       <p className="text-xs text-gray-500 mt-4 max-w-sm mx-auto">
          Ser du inte mappen direkt? Det kan ibland ta en minut för Google att synkronisera. Om den inte dyker upp, slutför onboardingen och fråga mig i chatten så hjälper jag dig.
       </p>

      <div className="mt-10">
        <button 
          onClick={handleComplete}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:bg-cyan-500 focus:ring-4 focus:ring-cyan-500/50"
        >
          Slutför & Gå till Dashboard
        </button>
      </div>
    </div>
  );
};

export default Step_Success;
