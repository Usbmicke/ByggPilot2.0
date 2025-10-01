
'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WelcomeHeader } from '@/app/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/app/components/dashboard/DashboardSummary';
import { ProjectList } from '@/app/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/app/components/dashboard/ActionSuggestions';
import CreateProjectModal from '@/app/components/modals/CreateProjectModal';
import GuidedTour from '@/app/components/tour/GuidedTour';
import TimeLoggerWidget from '@/app/components/dashboard/TimeLoggerWidget'; // Importera den nya widgeten

// Wrapper för att hantera sökparametrar för turen
const TourWrapper = () => {
    const searchParams = useSearchParams();
    const startTour = searchParams.get('tour') === 'true';
    return startTour ? <GuidedTour /> : null;
};

export default function DashboardPage() {
    const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

    // Dummy-data, kommer att ersättas med riktig data från sessionen
    const user = { name: 'Michael' }; 

    const handleNewProject = () => {
        setCreateProjectModalOpen(true);
    };

    return (
        <Suspense fallback={<div className='text-center p-8'>Laddar översikt...</div>}>
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

                    {/* KPI-korten */}
                    <DashboardSummary projectCount={0} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Huvudkolumn (vänster) */}
                        <div className="lg:col-span-2">
                            <div id="tour-step-2-projects">
                                <ProjectList onNewProject={handleNewProject} />
                            </div>
                        </div>
                        
                        {/* Sidokolumn (höger) med de nya widgetarna */}
                        <div className="space-y-8">
                            <TimeLoggerWidget />
                            <ActionSuggestions />
                        </div>

                    </div>
                </div>
            </div>
        </Suspense>
    );
}
