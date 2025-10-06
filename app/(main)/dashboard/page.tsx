
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/components/dashboard/ActionSuggestions';
import GuidedTour from '@/components/tour/GuidedTour';
import CreateNewButton from '@/components/dashboard/CreateNewButton';

// Wrapper to handle search params for the tour
const TourWrapper = () => {
    const searchParams = useSearchParams();
    const startTour = searchParams.get('tour') === 'true';
    return startTour ? <GuidedTour /> : null;
};

export default function DashboardPage() {

    return (
        <Suspense fallback={<div>Laddar översikt...</div>}>
            <TourWrapper />

            {/* The new centralized button is added here */}
            <CreateNewButton />

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
