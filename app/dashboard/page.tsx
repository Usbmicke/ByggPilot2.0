'use client';

import { useAuth } from '@/app/context/AuthContext';
import DashboardView from '@/app/components/views/DashboardView';
import ZeroState from '@/app/components/views/ZeroState';

// I en verklig applikation skulle denna data hämtas från Firestore.
// Vi simulerar detta för att demonstrera "Zero State".
const hasInitialData = false; // Sätt till `true` för att testa DashboardView

export default function DashboardPage() {
    const { user } = useAuth();

    if (!user) {
        return null; // AuthGuard sköter laddningsvy och omdirigering
    }

    // Denna sida avgör nu vilken vy som ska visas.
    // `DashboardView` och `ZeroState` är nu rena presentationskomponenter.
    return (
        <div className="h-full w-full">
            {hasInitialData ? (
                // Prop-listan är nu mycket renare
                <DashboardView username={user.displayName || 'Användare'} />
            ) : (
                <ZeroState username={user.displayName || 'Användare'} />
            )}
        </div>
    );
}
