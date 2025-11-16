'use client'

import React, { useState, useTransition, FC } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, FolderIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { callGenkitFlow } from '@/lib/genkit' // Importera Genkit-anropare

interface GuidedOnboardingProps {}

const GuidedOnboarding: FC<GuidedOnboardingProps> = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCompleteOnboarding = async () => {
    startTransition(async () => {
      const toastId = toast.loading('Konfigurerar ditt konto och skapar mappar...');
      try {
        // KORREKT ANROP: Anropa flödet som markerar onboarding som slutförd.
        await callGenkitFlow('completeOnboarding', undefined);
        
        toast.success('Kontot är konfigurerat!', { id: toastId });
        setActiveStep(1); // Gå vidare till nästa steg
      } catch (error) {
        console.error("Fel vid slutförande av onboarding:", error);
        toast.error('Kunde inte slutföra konfigurationen. Försök igen.', { id: toastId });
      }
    });
  }

  const handleNavigateToDashboard = () => {
    // Omdirigera till dashboard. Middleware kommer att hantera verifiering.
    router.push('/dashboard');
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Välkommen till ByggPilot AI!</h2>
      <p className="text-gray-600 mb-6">Kom igång genom att följa dessa två enkla steg.</p>
      <div className="space-y-4">
        <div className="flex items-start">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${activeStep >= 0 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <FolderIcon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">1. Slutför kontoinställning</h4>
                <p className="text-gray-600">Klicka här för att skapa nödvändiga mappar i din Google Drive och aktivera ditt konto.</p>
                <button onClick={handleCompleteOnboarding} disabled={isPending || activeStep > 0} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700">
                    {isPending ? 'Konfigurerar...' : 'Slutför inställning'}
                </button>
            </div>
        </div>

        <div className="flex items-start">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">2. Gå till din översikt</h4>
                <p className="text-gray-600">Allt är klart! Gå vidare till din dashboard för att börja arbeta.</p>
                <button onClick={handleNavigateToDashboard} disabled={activeStep < 1} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 hover:bg-green-700">
                    Gå till Dashboard
                </button>
            </div>
        </div>

      </div>
    </div>
  )
}

export default GuidedOnboarding;
