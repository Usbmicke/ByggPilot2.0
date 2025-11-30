'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useGenkit } from '@/hooks/useGenkit';
import { useGenkitMutation } from '@/hooks/useGenkitMutation';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase/client';

// Importera flödesobjekten från den säkra "klient"-filen
import { getUserProfileFlow, onboardingFlow } from '@/genkit/client';

// --- Ikoner ---
const BuildingOfficeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-muted-foreground"><path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0-.75.75v12.75a.75.75 0 0 0 .75.75h.75v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V18h.75a.75.75 0 0 0 .75-.75V3a.75.75 0 0 0-.75-.75h-6ZM9.75 18a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .742-.75v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75V9.313a2.25 2.25 0 0 0-1.23-2.043l-4.5-2.25a2.25 2.25 0 0 0-2.04 0l-4.5 2.25A2.25 2.25 0 0 0 6 9.313V18a.75.75 0 0 0 .75.75h3Z" clipRule="evenodd" /></svg>);
const ArrowUpTrayIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>);

const FullPageLoader = ({ text }: { text: string }) => (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <span className="text-lg">{text}</span>
    </div>
);

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Använd det importerade flödesobjektet direkt.
  const { data: profile, isLoading: isProfileLoading } = useGenkit(
    user ? getUserProfileFlow : null, // Kör bara om användaren är inloggad
    undefined
  );
  
  // Använd det importerade flödesobjektet direkt.
  const { mutate: runOnboarding, isLoading: isMutating, error: flowError } = useGenkitMutation(onboardingFlow);

  useEffect(() => {
    if (isAuthLoading || isProfileLoading) return;
    if (!user) router.push('/');
    // Om profilen finns och har ett företagsnamn, omdirigera till dashboard.
    if (profile?.companyName) router.push('/dashboard');
  }, [user, profile, isAuthLoading, isProfileLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
  };

  const uploadLogo = async (file: File, userId: string): Promise<string> => {
    const storage = getStorage(firebaseApp);
    const filePath = `logos/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let logoUrl: string | undefined = undefined;
    if (logoFile) logoUrl = await uploadLogo(logoFile, user.uid);

    try {
      const result = await runOnboarding({ companyName, logoUrl });
      if (result?.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error("Onboarding misslyckades", err);
    }
  };

  if (isAuthLoading || isProfileLoading || (user && profile?.companyName)) {
    return <FullPageLoader text="Laddar användardata..." />;
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">Välkommen till Byggpilot</h1>
        <p className="text-muted-foreground text-center mb-8">Ett sista steg. Berätta om ditt företag.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            {user?.email && <p className="text-center text-sm text-green-400 bg-green-900/50 p-2 rounded-md">✓ Inloggad som {user.email}</p>}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-muted-foreground mb-2">Företagsnamn</label>
              <div className="flex items-center bg-background rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-primary">
                <BuildingOfficeIcon />
                <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ditt Företag AB" className="w-full bg-transparent p-3 text-foreground placeholder-muted-foreground focus:outline-none" required />
              </div>
            </div>

            <div>
              <label htmlFor="logoUpload" className="block text-sm font-medium text-muted-foreground mb-2">Företagslogotyp (valfritt)</label>
               <div className="mt-2 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                      <div className="mx-auto text-muted-foreground w-12 h-12"><ArrowUpTrayIcon /></div>
                      <div className="flex text-sm text-muted-foreground">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary-hover p-1 px-2">
                              <span>Ladda upp en fil</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                          </label>
                          <p className="pl-1">eller dra och släpp</p>
                      </div>
                      <p className="text-xs text-muted-foreground/80">{logoFile ? logoFile.name : 'PNG, JPG, etc.'}</p>
                  </div>
              </div>
            </div>

            {flowError && <p className="text-red-500 text-sm text-center">Fel: {flowError.message}</p>}

            <button type="submit" disabled={isMutating || !companyName} className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition">
              {isMutating ? 'Skapar arbetsyta...' : 'Slutför & Skapa Mappar'}
            </button>
        </form>
      </div>
    </div>
  );
}
