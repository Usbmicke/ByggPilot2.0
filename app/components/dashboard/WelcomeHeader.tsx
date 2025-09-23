'use client';

import { useSession } from 'next-auth/react';

export function WelcomeHeader() {
    const { data: session } = useSession();
    // Använder fallback-värde om namnet inte finns, för en robustare upplevelse
    const userName = session?.user?.name?.split(' ')[0] || 'Byggare';

    return (
        <div className="pb-6 border-b border-gray-700">
            <h1 className="text-4xl font-bold tracking-tight text-white">
                Välkommen tillbaka, {userName}!
            </h1>
            <p className="mt-2 text-lg text-gray-400">Här är vad som händer i dina projekt idag.</p>
        </div>
    );
}
