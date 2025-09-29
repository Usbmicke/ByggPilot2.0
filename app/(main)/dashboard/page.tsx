'use client';

import React, { useState, Suspense } from 'react';
import { WelcomeHeader } from '@/app/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/app/components/dashboard/DashboardSummary';
import { ProjectList } from '@/app/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/app/components/dashboard/ActionSuggestions';
import ZeroState from '@/app/components/dashboard/ZeroState';
import CreateProjectModal from '@/app/components/dashboard/CreateProjectModal';
import GuidedTour from '@/app/components/tour/GuidedTour'; // IMPORTERAD

// TÖMD FÖR ATT VISA TOMT LÄGE FÖR TOUREN
const projects = [];

export default function DashboardPage() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    const user = { name: 'Sven' }; // Dummy-användare, kommer ersättas av riktig data

    const handleNewProject = () => {
        setIsCreateProjectModalOpen(true);
    };

    // Denna logik verkar vara för en äldre onboarding-process, kan tas bort senare.
    if (showOnboarding) {
        return <ZeroState onFinished={() => setShowOnboarding(false)} />;
    }

    return (
        // Använd Suspense för att säkerställa att tour-parametern läses korrekt
        <Suspense fallback={<div>Laddar översikt...</div>}>
            <CreateProjectModal 
                isOpen={isCreateProjectModalOpen} 
                onClose={() => setIsCreateProjectModalOpen(false)} 
            />
            {/* GUIDED TOUR-KOMPONENTEN TILLAGD HÄR */}
            <GuidedTour />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in space-y-8 py-8">
                    {/* ID TILLAGT FÖR STEG 1 I TOUREN */}
                    <div id="tour-step-1-welcome">
                        <WelcomeHeader user={user} />
                    </div>

                    <DashboardSummary projectCount={projects.length} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {/* ID TILLAGT FÖR STEG 2 I TOUREN */}
                            <div id="tour-step-2-projects">
                                <ProjectList projects={projects} onNewProject={handleNewProject} />
                            </div>
                        </div>
                        <div>
                            <ActionSuggestions onNewProject={handleNewProject} />
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
