
'use client'

import React, { useState, useTransition, FC } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, FolderIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { callGenkitFlow } from '@/lib/genkit' // Importera Genkit-anropare

// Gränssnittet är nu rent och utan onödiga props.
interface GuidedOnboardingProps {}

const GuidedOnboarding: FC<GuidedOnboardingProps> = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Ersätter den simulerade funktionen med ett riktigt Genkit-anrop.
  const handleCreateProject = async () => {
    startTransition(async () => {
      const toastId = toast.loading('Skapar ett exempelprojekt och offertmapp...');
      try {
        // Anropa det faktiska Genkit-flödet för att skapa projektet
        // Vi skickar med ett exempelnamn för det första projektet.
        await callGenkitFlow('createProjectFlow', { name: 'Exempelprojekt - Villa Renovering' });
        
        toast.success('Projektet har skapats!', { id: toastId });
        setActiveStep(1); // Gå vidare till nästa steg vid framgång
      } catch (error) {
        console.error("Fel vid skapande av projekt:", error);
        toast.error('Kunde inte skapa projektet. Försök igen.', { id: toastId });
      }
    });
  }

  const handleNavigateToProjects = () => {
    router.push('/dashboard/projects')
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
                <h4 className="text-lg font-semibold text-gray-800">1. Skapa ditt första projekt</h4>
                <p className="text-gray-600">Klicka här så skapar vi ett exempelprojekt och en offertmapp åt dig i din Google Drive.</p>
                <button onClick={handleCreateProject} disabled={isPending || activeStep > 0} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700">
                    {isPending ? 'Skapar...' : 'Skapa Projekt'}
                </button>
            </div>
        </div>

        <div className="flex items-start">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">2. Utforska din projektöversikt</h4>
                <p className="text-gray-600">Allt är klart! Gå vidare till din projektöversikt för att se resultatet.</p>
                <button onClick={handleNavigateToProjects} disabled={activeStep < 1} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400 hover:bg-green-700">
                    Gå till projekt
                </button>
            </div>
        </div>

      </div>
    </div>
  )
}

export default GuidedOnboarding
