'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

// Denna komponent skyddar en rutt genom att verifiera att en användare är inloggad.
// Om användaren inte är inloggad, omdirigeras de till landningssidan ('/').
// Medan autentiseringsstatusen kontrolleras visas en laddningsskärm.

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Omdirigera om statusen inte är 'authenticated' och inte heller 'loading'.
        // Detta täcker fallet 'unauthenticated'.
        if (status !== 'loading' && status !== 'authenticated') {
            router.push('/');
        }
    }, [status, router]);

    // Om statusen är 'loading' eller om användaren är oautentiserad 
    // (och omdirigeringen ännu inte har skett), visa en laddningsskärm.
    if (status === 'loading' || status !== 'authenticated') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <p>Verifierar åtkomst...</p>
            </div>
        );
    }

    // Om status är 'authenticated', rendera barnkomponenterna.
    return <>{children}</>;
}
