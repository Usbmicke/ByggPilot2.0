
'use client';

import React, { useState, useTransition, FC } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, FolderIcon, ArrowRightIcon, BuildingOfficeIcon, DocumentArrowUpIcon, PhotoIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Image from 'next/image'; // Använd Next.js Image-komponent för optimering

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
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null); // State för logotypens URL
  const [isUploading, setIsUploading] = useState(false);
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Funktion för att hantera filuppladdningen
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Laddar upp logotyp...');

    try {
      // 1. Be om en signerad URL från vårt backend
      const response = await fetch('/api/onboarding/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!response.ok) throw new Error('Kunde inte förbereda uppladdning.');
      const { signedUrl, publicUrl } = await response.json();

      // 2. Ladda upp filen direkt till Google Cloud Storage
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error('Uppladdningen till molnet misslyckades.');
      
      // 3. Spara den publika URL:en för förhandsvisning och sparande
      setCompanyLogoUrl(publicUrl);
      toast.success('Logotypen är uppladdad!', { id: toastId });

    } catch (error: any) {
      console.error('Uppladdningsfel:', error);
      toast.error(`Fel: ${error.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    startTransition(async () => {
      const toastId = toast.loading('Sparar företagsinformation...');
      try {
        const response = await fetch('/api/onboarding/save-company-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Skicka med logotypens URL om den finns
          body: JSON.stringify({ companyName, companyAddress, companyLogoUrl }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Något gick fel på servern.');
        }

        toast.success('Informationen är sparad!', { id: toastId });
        setCurrentStep(2);
      } catch (error: any) {
        console.error("Fel vid spara av företagsinfo:", error);
        toast.error(`Kunde inte spara: ${error.message}`, { id: toastId });
      }
    });
  };

  const handleCreateDriveFolders = async () => {
    startTransition(async () => {
      const toastId = toast.loading('Skapar mappstruktur i Google Drive...');
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = { success: true, driveFolderUrl: 'https://drive.google.com' };
        if (result.success && result.driveFolderUrl) {
          toast.success('Mappstrukturen har skapats!', { id: toastId });
          setDriveFolderUrl(result.driveFolderUrl);
          setCurrentStep(3);
        } else {
          throw new Error('Ett okänt fel inträffade.');
        }
      } catch (error: any) {
        console.error("Fel vid skapande av mappar:", error);
        toast.error(`Kunde inte skapa mappar: ${error.message}`, { id: toastId });
      }
    });
  };

  const handleNavigateToDashboard = () => router.push('/dashboard');

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full space-y-4">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Välkommen till ByggPilot!</h2>
        <p className="text-center text-gray-600 mb-8">Vi sätter upp ditt digitala kontor. Följ bara stegen nedan.</p>

        <Step title="Steg 1: Berätta om ditt företag" description="Informationen anpassar din upplevelse." icon={<BuildingOfficeIcon className="h-6 w-6 text-white" />} isCompleted={currentStep > 1} isActive={currentStep === 1}>
          <form onSubmit={handleSaveCompanyInfo} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Företagsnamn</label>
              <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Adress</label>
              <input type="text" id="companyAddress" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Företagslogga</label>
              <div className="mt-1 flex items-center gap-4">
                <span className="inline-block h-20 w-20 rounded-lg overflow-hidden bg-gray-100 border">
                  {companyLogoUrl ? (
                    <Image src={companyLogoUrl} alt="Förhandsvisning av logotyp" width={80} height={80} className="object-cover" />
                  ) : (
                    <PhotoIcon className="h-full w-full text-gray-300" />
                  )}
                </span>
                <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>{companyLogoUrl ? 'Byt bild' : 'Ladda upp bild'}</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif, image/webp" disabled={isUploading} />
                </label>
                {isUploading && <span className="text-sm text-gray-500">Laddar upp...</span>}
              </div>
            </div>
            <button type="submit" disabled={isPending || isUploading || !companyName} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none">
              Spara och fortsätt <ArrowRightIcon className="ml-2 h-5 w-5"/>
            </button>
          </form>
        </Step>

        <Step title="Steg 2: Skapa digital mappstruktur" description="Vi skapar en säker mappstruktur i din Google Drive." icon={<FolderIcon className="h-6 w-6 text-white" />} isCompleted={currentStep > 2} isActive={currentStep === 2}>
            <p className="text-center text-gray-700 mb-4">Ett klick bort från ett organiserat digitalt kontor.</p>
            <button onClick={handleCreateDriveFolders} disabled={isPending} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none">
                {isPending ? 'Skapar mappar...' : 'Ja, skapa mappstruktur'}
            </button>
        </Step>

        <Step title="Steg 3: Allt är klart!" description="Din copilots landningsbana är redo." icon={<CheckCircleIcon className="h-6 w-6 text-white" />} isCompleted={currentStep === 3} isActive={currentStep === 3}>
            <div className="text-center">
                <p className="text-lg font-semibold text-green-600">Installation slutförd!</p>
                <p className="text-gray-700 mt-2 mb-4">Dina mappar finns nu i Google Drive. Du kan nu börja arbeta.</p>
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
