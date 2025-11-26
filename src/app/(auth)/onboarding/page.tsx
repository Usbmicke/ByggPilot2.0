
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/client/auth';
import { runFlow } from '@genkit-ai/flow/client';
import { onboardingFlow } from '@/genkit/flows/onboardingFlow';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function OnboardingPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !companyName || !logoFile) {
      setError('Fyll i alla fält och välj en logotyp.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Upload logo to Firebase Storage
      const storage = getStorage();
      const logoRef = ref(storage, `logos/${user.uid}/${logoFile.name}`);
      await uploadBytes(logoRef, logoFile);
      const logoUrl = await getDownloadURL(logoRef);

      // 2. Run the onboarding Genkit flow
      const result = await runFlow(onboardingFlow, {
        uid: user.uid,
        companyName,
        logoUrl,
      });

      if (!result.success) {
        throw new Error(result.message || 'Ett okänt fel uppstod i onboarding-flödet.');
      }

      // Redirect is handled by AuthHandler, which will detect the change in `hasOnboarded`
      // No explicit router.push('/dashboard') is needed here.

    } catch (err: any) {
      console.error('Onboarding submission failed:', err);
      setError(err.message || 'Ett fel uppstod. Vänligen försök igen.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Slutför din profil</h1>
          <p className="mt-2 text-gray-600">Berätta lite om ditt företag.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Företagsnamn
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
              Företagslogotyp
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              required
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Sparar...' : 'Slutför & Gå till Dashboard'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </main>
  );
}
