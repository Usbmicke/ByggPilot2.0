'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGenkitMutation } from '@/hooks/useGenkitMutation'; // Importera den nya hooken

// Firebase & Google Auth
import { getAuth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase/client';

// Ikoner (behålls som tidigare)
const BuildingOfficeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-gray-400"><path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0-.75.75v12.75a.75.75 0 0 0 .75.75h.75v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V18h.75a.75.75 0 0 0 .75-.75V3a.75.75 0 0 0-.75-.75h-6ZM9.75 18a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .742-.75v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75V9.313a2.25 2.25 0 0 0-1.23-2.043l-4.5-2.25a2.25 2.25 0 0 0-2.04 0l-4.5 2.25A2.25 2.25 0 0 0 6 9.313V18a.75.75 0 0 0 .75.75h3Z" clipRule="evenodd" /></svg>);
const ArrowUpTrayIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>);
const GoogleIcon = () => ( <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.251 46.944 30.861 46.944 24c0-1.341-.138-2.65-.389-3.917z"/></svg>);

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);
  
  // Använd vår nya, robusta hook för mutationer
  const { trigger: runOnboardingFlow, isMutating, error: flowError } = useGenkitMutation('onboardingFlow');

  useEffect(() => {
    // Lyssna på ändringar i autentiseringsstatus
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      // Om användaren loggar ut, rensa token
      if (!currentUser) {
        setGoogleAccessToken(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        setUser(result.user);
        setAuthError(null);
      } else {
        throw new Error("Kunde inte hämta åtkomsttoken från Google.");
      }
    } catch (error) {
      console.error("Google-inloggning misslyckades", error);
      setAuthError("Inloggningen med Google misslyckades. Vänligen försök igen.");
    }
  }

  const uploadLogo = async (file: File, userId: string): Promise<string> => {
    const filePath = `logos/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      setAuthError('Företagsnamn är obligatoriskt.');
      return;
    }
    if (!user || !googleAccessToken) {
      setAuthError("Du måste vara inloggad med Google för att fortsätta.");
      return;
    }

    setAuthError(null);

    try {
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, user.uid);
      }

      // Anropa flödet via hooken
      const result = await runOnboardingFlow({ 
        companyName, 
        logoUrl, 
        userAccessToken 
      });

      if (result.success) {
        router.push('/dashboard'); // Omdirigera till en framtida dashboard
      } else {
        // Felmeddelande hanteras nu av hookens 'error'-state
      }
    } catch (err) {
      // Fel hanteras redan av hooken och kommer att finnas i 'flowError'
      console.error("Ett fel inträffade under anrop av onboarding-flödet", err);
    }
  };
  
  const displayError = authError || flowError?.message;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all">
        <h1 className="text-3xl font-bold text-center mb-2">Välkommen till Byggpilot</h1>
        <p className="text-gray-400 text-center mb-8">Ett sista steg. Bekräfta dina företagsuppgifter.</p>
        
        {!user || !googleAccessToken ? (
          <div className="text-center">
             <p className="text-gray-300 mb-6">För att skapa din arbetsyta i Google Drive behöver vi din tillåtelse.</p>
            <button onClick={handleGoogleSignIn} className="w-full inline-flex items-center justify-center bg-white text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-300">
                <GoogleIcon />
                Logga in med Google & Ge åtkomst
            </button>
            {displayError && <p className="text-red-500 text-sm text-center mt-4">{displayError}</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-center text-sm text-green-400 bg-green-900/50 p-2 rounded-md">✓ Inloggad som {user.email}</p>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">Företagsnamn</label>
              <div className="flex items-center bg-gray-700 rounded-lg border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500">
                <BuildingOfficeIcon />
                <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ditt Företag AB" className="w-full bg-transparent p-3 text-white placeholder-gray-500 focus:outline-none" required />
              </div>
            </div>
            <div>
              <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-300 mb-2">Företagslogotyp (valfritt)</label>
              <div className="mt-2 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                      <div className="mx-auto text-gray-400 w-12 h-12"><ArrowUpTrayIcon /></div>
                      <div className="flex text-sm text-gray-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 p-1 px-2">
                              <span>Ladda upp en fil</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                          </label>
                          <p className="pl-1">eller dra och släpp</p>
                      </div>
                      <p className="text-xs text-gray-500">{logoFile ? logoFile.name : 'PNG, JPG upp till 10MB'}</p>
                  </div>
              </div>
            </div>
            {displayError && <p className="text-red-500 text-sm text-center">{displayError}</p>}
            <button type="submit" disabled={isMutating || !companyName} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              {isMutating ? 'Skapar arbetsyta...' : 'Slutför & Skapa Mappar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
