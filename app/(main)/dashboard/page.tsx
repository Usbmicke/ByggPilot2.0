
'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WelcomeHeader } from '@/app/components/dashboard/WelcomeHeader';
import { ProjectList } from '@/app/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/app/components/dashboard/ActionSuggestions';
import CreateProjectModal from '@/app/components/modals/CreateProjectModal';
import GuidedTour from '@/app/components/tour/GuidedTour';
import ActivityLoggerWidget from '@/app/components/dashboard/ActivityLoggerWidget';

const TourWrapper = () => {
    const searchParams = useSearchParams();
    const startTour = searchParams.get('tour') === 'true';
    return startTour ? <GuidedTour /> : null;
};

export default function DashboardPage() {
    const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

    const handleNewProject = () => {
        setCreateProjectModalOpen(true);
    };

    return (
        <Suspense fallback={<div className='text-center p-8'>Laddar Guldstandard...</div>}>
            <CreateProjectModal 
                isOpen={isCreateProjectModalOpen} 
                onClose={() => setCreateProjectModalOpen(false)} 
            />
            
            <TourWrapper />

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in space-y-8 py-8">
                    
                    {/* --- GULDSTANDARD ENHETLIG KOMMANDOBRYGGA --- */}
                    <div id="tour-step-1-welcome">
                        <WelcomeHeader />
                    </div>

                    {/* --- HUVUDINNEHÅLL --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Huvudkolumn (vänster) */}
                        <div className="lg:col-span-2">
                            <div id="tour-step-2-projects">
                                <ProjectList onNewProject={handleNewProject} />
                            </div>
                        </div>
                        
                        {/* Sidokolumn (höger) */}
                        <div className="space-y-8">
                            <ActivityLoggerWidget />
                            <ActionSuggestions />
                        </div>

                    </div>
                </div>
            </div>
        </Suspense>
    );
}
