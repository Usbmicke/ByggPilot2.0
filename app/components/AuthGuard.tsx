'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore as db } from '@/app/lib/firebase/client'; // Korrigerad import

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Skyddar rutter och säkerställer att varje inloggad användare har ett användardokument
 * i Firestore med en definierad `onboardingStatus`.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return; // Vänta tills Firebase Auth har initialiserats
    }

    if (!user) {
      router.push('/'); // Användaren är inte inloggad, skicka till startsidan
      return;
    }

    // Användaren är inloggad, verifiera eller skapa användardokument i Firestore.
    const verifyOrCreateUserDocument = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Användardokumentet finns inte, detta är första inloggningen.
        try {
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            createdAt: new Date(),
            onboardingStatus: 'pending', // Startstatus enligt planen
          });
        } catch (error) {
          console.error("Kunde inte skapa användardokument:", error);
          return;
        }
      }
      setIsVerified(true);
    };

    verifyOrCreateUserDocument();

  }, [user, authLoading, router]);

  if (!isVerified) {
    return <div className="fixed inset-0 bg-[#0B2545] flex items-center justify-center text-white">Konfigurerar ditt konto...</div>;
  }

  return <>{children}</>;
}
