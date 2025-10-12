
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/components/dashboard/ActionSuggestions';
import GuidedTour from '@/components/tour/GuidedTour';
import { getUserData, markTourAsCompleted } from '@/actions/userActions'; // Korrigerad import
import { useSession } from 'next-auth/react'; // Importera useSession

function DashboardContent() {
    const [showTour, setShowTour] = useState(false);
    const searchParams = useSearchParams();
    const { data: session } = useSession(); // Hämta sessionen

    useEffect(() => {
        if (!session?.user?.id) return; // Vänta på att sessionen laddas

        const tourParam = searchParams.get('tour');
        if (tourParam === 'true') {
            console.log("[Dashboard]: Initierar guidad tur via URL-parameter.");
            setShowTour(true);
        } else {
            const checkTourStatus = async () => {
                // Använd session.user.id istället för att hämta det på annat sätt
                const userData = await getUserData(session.user.id!);
                if (userData?.onboardingComplete && !userData?.tourCompleted) {
                    console.log("[Dashboard]: Initierar guidad tur via databas-status.");
                    setShowTour(true);
                }
            };
            checkTourStatus();
        }
    }, [searchParams, session]);

    const handleTourComplete = async () => {
        if (!session?.user?.id) return;
        console.log("[Dashboard]: Guidad tur slutförd. Markerar i databasen.");
        setShowTour(false);
        await markTourAsCompleted(session.user.id);
    };

    return (
        <>
            {showTour && <GuidedTour onComplete={handleTourComplete} />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in space-y-8 py-8">
                    <div id="tour-step-1-welcome">
                        <WelcomeHeader />
                    </div>

                    <DashboardSummary projectCount={0} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div id="tour-step-2-projects">
                                <ProjectList />
                            </div>
                        </div>
                        <div>
                            <ActionSuggestions />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function DashboardPage() {
    return (
        // SessionProvider behövs för att useSession ska fungera
        // Men den finns troligtvis redan i en högre layout-fil, så vi behöver inte lägga till den här.
        <Suspense fallback={<div>Laddar översikt...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
