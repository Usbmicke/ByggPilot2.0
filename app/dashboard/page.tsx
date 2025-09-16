'use client';

import { useAuth } from '@/app/context/AuthContext';
import DashboardView from '@/app/components/views/DashboardView';
import ZeroState from '@/app/components/views/ZeroState';

// I en verklig applikation skulle denna data hämtas från Firestore.
// Vi simulerar detta för att demonstrera "Zero State".
const fetchedProjects: any[] = []; // Tom lista för att tvinga Zero State

export default function DashboardPage() {
    const { user } = useAuth(); // Använder vår centraliserade AuthContext

    // Om vi inte har någon användardata än, visa inget. AuthGuard hanterar laddning.
    if (!user) {
        return null;
    }

    // Kontrollera om det finns några projekt.
    const hasProjects = fetchedProjects.length > 0;

    return (
        <div className="h-full w-full">
            {hasProjects ? (
                // **Normalt Läge:** Användaren har data.
                // Rendera den vanliga instrumentpanelen med användarens projekt.
                <DashboardView
                    projects={fetchedProjects}
                    customers={[]}
                    username={user.displayName || 'Användare'}
                />
            ) : (
                // **Zero State:** Ny användare utan data.
                // Rendera välkomstskärmen med en proaktiv AI-onboarding.
                <ZeroState username={user.displayName || 'Användare'} />
            )}
        </div>
    );
}
