
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/components/dashboard/ActionSuggestions';
import GuidedTour from '@/components/tour/GuidedTour';
import { getUserStatus, markTourAsCompleted } from '@/app/actions/userActions';

// =================================================================================
// GULDSTANDARD - Dashboard V2.0 (TOUR-INITIERING VIA URL)
// REVIDERING: Lägger till logik för att läsa en URL-parameter (`?tour=true`).
// Detta möjliggör direktstart av den guidade turen från en länk, t.ex. efter
// avslutat onboarding-flöde. Den befintliga databas-kontrollen behålls som fallback.
// =================================================================================

function DashboardContent() {
    const [showTour, setShowTour] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const tourParam = searchParams.get('tour');
        if (tourParam === 'true') {
            console.log("[Dashboard]: Initierar guidad tur via URL-parameter.");
            setShowTour(true);
        } else {
            const checkTourStatus = async () => {
                const status = await getUserStatus();
                if (status.onboardingComplete && !status.tourCompleted) {
                    console.log("[Dashboard]: Initierar guidad tur via databas-status.");
                    setShowTour(true);
                }
            };
            checkTourStatus();
        }
    }, [searchParams]);

    const handleTourComplete = async () => {
        console.log("[Dashboard]: Guidad tur slutförd. Markerar i databasen.");
        setShowTour(false);
        await markTourAsCompleted();
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
        <Suspense fallback={<div>Laddar översikt...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
