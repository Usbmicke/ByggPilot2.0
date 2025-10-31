
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircleIcon, ExclamationCircleIcon, ArrowRightIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { setupDriveForOnboarding, finalizeOnboarding } from '@/app/onboarding/actions';
import { markOnboardingAsComplete } from '@/app/actions/userActions'; // MOMENT 2: Importera minnesfunktionen

type OnboardingStep = 'input' | 'confirmDrive' | 'creating' | 'success' | 'finalizing' | 'error';

interface CompanyData {
  companyName: string;
  orgNumber: string;
  address: string;
  zipCode: string;
  city: string;
  phone: string;
}

interface DriveData {
  driveRootFolderId: string;
  driveRootFolderUrl: string;
}

/**
 * Guidad Onboarding (v16 - Arkitektur med Datapersistens)
 * Denna version är den slutgiltiga. Den säkerställer att användarens status permanentas
 * i databasen INNAN navigering sker, vilket löser både "minnesförlusten" vid ny
 * inloggning och "flimret" vid den initiala omdirigeringen.
 * 1. AWAIT: Permanent markering i databasen (Firestore).
 * 2. AWAIT: Skapande av företagsdata och mappstruktur.
 * 3. AWAIT: Synkronisering av den lokala sessionen.
 * 4. NAVIGERA: Först när allt ovan är bekräftat sker navigering.
 */
export function GuidedOnboarding() {
  const { data: session, update: updateSession } = useSession(); // Hämta hela session-objektet för att få userId
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<OnboardingStep>('input');
  const [companyData, setCompanyData] = useState<CompanyData>({ 
    companyName: '', orgNumber: '', address: '', zipCode: '', city: '', phone: '' 
  });
  const [driveData, setDriveData] = useState<DriveData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToConfirmation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (companyData.companyName.trim().length < 2) {
      setError('Företagsnamnet måste vara minst 2 tecken.');
      return;
    }
    setError(null);
    setStep('confirmDrive');
  };

  const handleCreateStructure = () => {
    setStep('creating');
    startTransition(async () => {
      const result = await setupDriveForOnboarding(companyData.companyName);
      if (result.success && result.data) {
        setDriveData(result.data);
        setStep('success');
      } else {
        setError(result.error || 'Ett okänt fel uppstod vid skapande av mappar.');
        setStep('error');
      }
    });
  };

  const handleFinalizeAndNavigate = () => {
    if (!driveData || !session?.user?.id) {
        setError("Användardata saknas, kan inte slutföra. Prova att ladda om sidan.");
        setStep('error');
        return;
    }
    setError(null);
    setStep('finalizing');

    const fullData = { ...companyData, ...driveData };
    const userId = session.user.id;

    startTransition(async () => {
      // MOMENT 2: Implementera den korrekta, persistenta sekvensen
      
      // STEG 1: Anropa och invänta den PERMANENTA databasuppdateringen.
      const persistentUpdateResult = await markOnboardingAsComplete(userId);
      if (!persistentUpdateResult.success) {
          setError(persistentUpdateResult.error || 'Kunde inte permanent spara din status. Vänligen försök igen.');
          setStep('error');
          return;
      }
      
      // STEG 2: Anropa och invänta skapandet av företagsdata och mappar.
      const finalizeResult = await finalizeOnboarding(fullData);
      if (!finalizeResult.success) {
        setError(finalizeResult.error || 'Ett kritiskt fel uppstod när din profil skulle slutföras.');
        setStep('error');
        return;
      }
      
      // STEG 3: Anropa och invänta den TEMPORÄRA, lokala session-synkroniseringen.
      await updateSession({ onboardingComplete: true });
      
      // STEG 4: FÖRST DÄREFTER, navigera.
      router.push('/dashboard');
    });
  };

  const renderContent = () => {
    switch (step) {
      case 'input':
        return (
          <form onSubmit={handleProceedToConfirmation} className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-text-primary">Ditt digitala kontor</h1>
              <p className="mt-4 text-lg text-text-secondary">Börja med att fylla i din företagsinformation. Denna information används för att automatiskt fylla i dokument, som offerter.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="companyName" value={companyData.companyName} onChange={handleInputChange} placeholder="Företagsnamn (obligatoriskt)" required minLength={2} className="sm:col-span-2 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
              <input name="orgNumber" value={companyData.orgNumber} onChange={handleInputChange} placeholder="Organisationsnummer" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
              <input name="phone" value={companyData.phone} onChange={handleInputChange} placeholder="Telefonnummer" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
              <input name="address" value={companyData.address} onChange={handleInputChange} placeholder="Gatuadress" className="sm:col-span-2 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
              <input name="zipCode" value={companyData.zipCode} onChange={handleInputChange} placeholder="Postnummer" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
              <input name="city" value={companyData.city} onChange={handleInputChange} placeholder="Ort" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-3 bg-accent-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50">Nästa</button>
          </form>
        );

      case 'confirmDrive':
        return (
            <div className="text-center animate-fade-in space-y-6">
                <DocumentTextIcon className="w-16 h-16 text-accent-blue mx-auto" />
                <h1 className="text-3xl font-bold text-text-primary">Dags att skapa ditt digitala kontor</h1>
                <p className="text-lg text-text-secondary">Nästa steg är att skapa en mappstruktur i din Google Drive. Det här blir ditt centrala nav där ByggPilot hjälper dig att organisera projekt, offerter och dokument. Allt lagras säkert på din egen Drive.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setStep('input')} className="w-full sm:w-auto px-6 py-3 border border-gray-600 rounded-lg text-text-secondary hover:bg-gray-700">Tillbaka</button>
                    <button onClick={handleCreateStructure} disabled={isPending} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-accent-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50">
                        {isPending ? 'Skapar...' : 'Godkänn och skapa mappar'}
                    </button>
                </div>
            </div>
        );

      case 'creating':
      case 'finalizing':
        return (
          <div className="text-center animate-fade-in p-8 rounded-lg bg-gray-800 shadow-lg">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto"></div>
            <h1 className="text-2xl font-bold text-text-primary">{step === 'creating' ? 'Skapar din mappstruktur...' : 'Slutför konfigurationen...'}</h1>
            <p className="mt-3 text-text-secondary">{step === 'creating' ? 'Ett ögonblick, vi bygger upp ditt kontor i Google Drive.' : 'Vi sparar din profil och förbereder instrumentpanelen. Omdirigerar strax...'}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center animate-fade-in space-y-6">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold text-text-primary">Ditt kontor är redo!</h1>
            <p className="text-lg text-text-secondary">En ny mappstruktur för "{companyData.companyName}" har skapats i din Google Drive.</p>
            {driveData?.driveRootFolderUrl && <a href={driveData.driveRootFolderUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-accent-blue hover:underline">Öppna mappen för att inspektera</a>}
            <button onClick={handleFinalizeAndNavigate} disabled={isPending} className="w-full flex items-center justify-center gap-3 bg-accent-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50">
              {isPending ? 'Slutför...' : 'Slutför & gå till instrumentpanelen'}<ArrowRightIcon className='h-5 w-5 ml-2'/>
            </button>
          </div>
        );

      case 'error':
        return (
            <div className="text-center animate-fade-in space-y-6">
                <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
                <h1 className="text-3xl font-bold text-text-primary">Något gick fel</h1>
                <p className="text-lg text-text-secondary bg-red-900/50 p-4 rounded-lg">{error}</p>
                <button onClick={() => setStep('input')} className="text-accent-blue hover:underline">Börja om</button>
            </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center p-8 md:p-12 bg-gray-900">
        <div className="max-w-md mx-auto w-full">
            {renderContent()}
        </div>
    </div>
  );
}
