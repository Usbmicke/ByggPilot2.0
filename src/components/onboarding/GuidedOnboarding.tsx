
'use client'

import React, { useState, useTransition, FC } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, FolderIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

// import { OnboardingStep } from '@/app/types/index' // BORTTAGET

// ===================================================================================================
// ONBOARDING RECONSTRUCTION V2.2 - PROPS CLEANUP
// ===================================================================================================
// Kravet på `steps` är borttaget från interfacet eftersom prop:en inte längre används.
// Detta löser TypeScript-felet vid bygge.
// ===================================================================================================

// `steps` är inte längre obligatorisk.
interface GuidedOnboardingProps {
  // steps: OnboardingStep[] // BORTTAGET
}

const GuidedOnboarding: FC<GuidedOnboardingProps> = (/*{ steps }*/) => {
  const [activeStep, setActiveStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreateProject = async () => {
    toast.loading('Funktionen är för närvarande inaktiverad...');

    console.log("TODO: Anropa Genkit-flödet `createProjectFlow` här.");

    setTimeout(() => {
        toast.dismiss();
        toast.success('Simulering lyckad! Gå till nästa steg.');
        setActiveStep(1);
    }, 1500);
  }

  const handleNavigateToProjects = () => {
    router.push('/dashboard/projects')
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Välkommen till ByggPilot AI!</h2>
      <div className="space-y-4">
        <div className="flex items-start">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${activeStep >= 0 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <FolderIcon className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-800">Skapa ditt första projekt</h4>
                <p className="text-gray-600">Vi skapar ett exempelprojekt och en offertmapp åt dig i din Google Drive.</p>
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
                <h4 className="text-lg font-semibold text-gray-800">Utforska ditt dashboard</h4>
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
