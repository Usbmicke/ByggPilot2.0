
'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/components/dashboard/ActionSuggestions';
import CreateProjectModal from '@/components/modals/CreateProjectModal'; // <-- KORRIGERAD SÖKVÄG
import GuidedTour from '@/components/tour/GuidedTour';

// Wrapper för att hantera sökparametrar för turen
const TourWrapper = () => {
    const searchParams = useSearchParams();
    const startTour = searchParams.get('tour') === 'true';
    return startTour ? <GuidedTour /> : null;
};

export default function DashboardPage() {
    const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

    const user = { name: 'Sven' }; // Dummy-data

    // Funktion för att öppna modalen. Denna skickas nu ner till ProjectList.
    const handleNewProject = () => {
        setCreateProjectModalOpen(true);
    };

    return (
        <Suspense fallback={<div>Laddar översikt...</div>}>
            <CreateProjectModal 
                isOpen={isCreateProjectModalOpen} 
                onClose={() => setCreateProjectModalOpen(false)} 
            />
            
            <TourWrapper />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in space-y-8 py-8">
                    <div id="tour-step-1-welcome">
                        <WelcomeHeader user={user} />
                    </div>

                    <DashboardSummary projectCount={0} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div id="tour-step-2-projects">
                                {/* Skicka ner handleNewProject som en prop */}
                                <ProjectList onNewProject={handleNewProject} />
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
