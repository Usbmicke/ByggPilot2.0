
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/components/dashboard/ActionSuggestions';
import GuidedTour from '@/components/tour/GuidedTour';
import { getUserStatus, markTourAsCompleted } from '@/app/actions/userActions'; // Antagna server actions

export default function DashboardPage() {
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        const checkTourStatus = async () => {
            const status = await getUserStatus();
            if (status.onboardingComplete && !status.tourCompleted) {
                setShowTour(true);
            }
        };
        checkTourStatus();
    }, []);

    const handleTourComplete = async () => {
        setShowTour(false);
        await markTourAsCompleted();
    };

    return (
        <Suspense fallback={<div>Laddar översikt...</div>}>
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
        </Suspense>
    );
}
