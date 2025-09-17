'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/app/lib/firebase/client';
import { useRouter } from 'next/navigation';
import DashboardView from '@/app/components/views/DashboardView';

// Definierar en typ för vår användardata från Firestore
interface UserData {
  displayName: string;
  onboardingStatus: 'pending' | 'companyInfoNeeded' | 'completed';
  // Lägg till andra fält från ditt Firestore-dokument här
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Om useAuth säger att vi inte är inloggade och laddningen är klar,
    // skicka tillbaka användaren till startsidan.
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    // Om vi har en användare, hämta deras data från Firestore.
    if (user) {
      const fetchUserData = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          // Detta bör teoretiskt sett aldrig hända pga AuthContext,
          // men är bra att ha som en fallback.
          console.error("Hittade inget användardokument i Firestore!");
          // Hantera felet, t.ex. logga ut användaren
        }
        setIsLoadingData(false);
      };

      fetchUserData();
    }
  }, [user, authLoading, router]);

  // Visa en global laddningsindikator medan vi väntar på autentisering eller data
  if (authLoading || isLoadingData) {
    return <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">Laddar instrumentpanel...</div>;
  }

  // Om vi har kommit hit men inte har någon användardata är något fel.
  if (!userData) {
     return <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">Kunde inte ladda användardata.</div>;
  }

  // Nu kan vi rendera olika vyer baserat på onboarding-status
  switch (userData.onboardingStatus) {
    case 'pending':
      // TODO: Skapa en snyggare Onboarding-komponent för detta.
      return (
          <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white">
              <h1 className="text-3xl font-bold mb-4">Välkommen till ByggPilot, {userData.displayName}!</h1>
              <p className="text-xl">Vi behöver bara lite mer information för att komma igång.</p>
              <p className="mt-8">Onboarding Status: <strong>PENDING</strong></p>
              {/* Nästa steg kommer att ersätta detta med en formulär-komponent */}
          </div>
      );
    case 'companyInfoNeeded':
       // Detta är nästa steg i din plan
       return <div>Company Info Needed Component Here</div>;
    case 'completed':
      return <DashboardView username={userData.displayName || 'Användare'} />;
    default:
      return <div>Okänd onboarding-status.</div>;
  }
}
