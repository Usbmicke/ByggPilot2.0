'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

// Denna komponent skyddar en rutt genom att verifiera att en användare är inloggad.
// Om användaren inte är inloggad, omdirigeras de till landningssidan ('/').
// Medan autentiseringsstatusen kontrolleras visas en laddningsskärm.

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Vi väntar tills laddningen är klar och om det inte finns någon användare.
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Om det fortfarande laddas, visa en platshållare.
    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <p>Verifierar åtkomst...</p>
            </div>
        );
    }

    // Om laddningen är klar och det finns en användare, rendera barnkomponenterna.
    return <>{children}</>;
}
