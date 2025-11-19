
'use client';

import React, { useState, useTransition, FC } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, FolderIcon, ArrowRightIcon, BuildingOfficeIcon, DocumentArrowUpIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { callGenkitFlow } from '@/app/_lib/genkit';

const Step = ({ title, description, icon, isCompleted, isActive, children }) => (
  <div className={`p-6 rounded-lg border-2 ${isActive ? 'border-blue-600' : 'border-transparent'} ${isCompleted ? 'opacity-50' : ''}`}>
    <div className="flex items-center">
      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isCompleted || isActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
    {isActive && <div className="mt-6">{children}</div>}
  </div>
);

const GuidedOnboarding: FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSaveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const toastId = toast.loading('Sparar företagsinformation...');
      try {
        await callGenkitFlow('saveCompanyInfo', { companyName, companyAddress });
        toast.success('Informationen är sparad!', { id: toastId });
        setCurrentStep(2);
      } catch (error) {
        console.error("Fel vid spara av företagsinfo:", error);
        toast.error('Kunde inte spara informationen.', { id: toastId });
      }
    });
  };

  const handleCreateDriveFolders = async () => {
    startTransition(async () => {
      const toastId = toast.loading('Skapar mappstruktur i Google Drive...');
      try {
        const result = await callGenkitFlow('completeOnboarding', undefined);
        if (result.success && result.driveFolderUrl) {
            toast.success('Mappstrukturen har skapats!', { id: toastId });
            setDriveFolderUrl(result.driveFolderUrl);
            setCurrentStep(3);
        } else {
            throw new Error(result.message || 'Ett okänt fel inträffade.');
        }
      } catch (error) {
        console.error("Fel vid skapande av mappar:", error);
        toast.error(`Kunde inte skapa mappar: ${error.message}`, { id: toastId });
      }
    });
  };

  const handleNavigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full space-y-4">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Välkommen till ByggPilot!</h2>
            <p className="text-center text-gray-600 mb-8">Vi sätter upp ditt digitala kontor. Följ bara stegen nedan.</p>

            {/* Steg 1: Företagsinformation */}
            <Step
                title="Steg 1: Berätta om ditt företag"
                description="Denna information används för att anpassa din upplevelse."
                icon={<BuildingOfficeIcon className="h-6 w-6 text-white" />}
                isCompleted={currentStep > 1}
                isActive={currentStep === 1}
            >
                <form onSubmit={handleSaveCompanyInfo} className="space-y-4">
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Företagsnamn</label>
                        <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Adress (Frivilligt)</label>
                        <input type="text" id="companyAddress" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Företagslogga (Kommer snart)</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400"/>
                          <p className="text-sm text-gray-600">Funktion för att ladda upp logotyp är under utveckling.</p>
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={isPending || !companyName} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none">
                        Spara och fortsätt <ArrowRightIcon className="ml-2 h-5 w-5"/>
                    </button>
                </form>
            </Step>

            {/* Steg 2: Skapa Mappstruktur */}
            <Step
                title="Steg 2: Skapa digital mappstruktur"
                description="Vi skapar en säker och organiserad mappstruktur i din Google Drive."
                icon={<FolderIcon className="h-6 w-6 text-white" />}
                isCompleted={currentStep > 2}
                isActive={currentStep === 2}
            >
                <p className="text-center text-gray-700 mb-4">Ett klick bort från ett organiserat digitalt kontor. Mapparna skapas direkt i din anslutna Google Drive.</p>
                <button onClick={handleCreateDriveFolders} disabled={isPending} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none">
                    {isPending ? 'Skapar mappar...' : 'Ja, skapa mappstruktur'}
                </button>
            </Step>

            {/* Steg 3: Färdig! */}
            <Step
                title="Steg 3: Allt är klart!"
                description="Din copilots landningsbana är redo. Välkommen ombord."
                icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
                isCompleted={currentStep === 3}
                isActive={currentStep === 3}
            >
                <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">Installation slutförd!</p>
                    <p className="text-gray-700 mt-2 mb-4">Mapparna har skapats i din Google Drive. Klicka nedan för att se dem, eller gå direkt till din dashboard för att börja arbeta.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={driveFolderUrl} target="_blank" rel="noopener noreferrer" className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Öppna Google Drive
                        </a>
                        <button onClick={handleNavigateToDashboard} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                            Gå till Dashboard
                        </button>
                    </div>
                </div>
            </Step>
        </div>
    </div>
  );
}

export default GuidedOnboarding;
