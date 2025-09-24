'use client';

import React, { useState } from 'react';
import { WelcomeHeader } from '@/app/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/app/components/dashboard/DashboardSummary';
import { ProjectList } from '@/app/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/app/components/dashboard/ActionSuggestions';
import ZeroState from '@/app/components/dashboard/ZeroState';
import CreateProjectModal from '@/app/components/dashboard/CreateProjectModal';

const projects = [
    { id: '1', name: 'Renovering kök, familjen Andersson', status: 'Pågående', lastActivity: '2 timmar sedan' },
    { id: '2', name: 'Altanbygge, Brf. Solsidan', status: 'Väntar på kund', lastActivity: '1 dag sedan' },
    { id: '3', name: 'Stambyte, HSB Stockholm', status: 'Planerad', lastActivity: '3 dagar sedan' },
];

export default function DashboardPage() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    const user = { name: 'Sven' };

    const handleNewProject = () => {
        setIsCreateProjectModalOpen(true);
    };

    if (showOnboarding) {
        return <ZeroState onFinished={() => setShowOnboarding(false)} />;
    }

    return (
        <>
            <CreateProjectModal 
                isOpen={isCreateProjectModalOpen} 
                onClose={() => setIsCreateProjectModalOpen(false)} 
            />

            {/* NYTT: Centrerad container med max-bredd och padding */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Den ursprungliga containern, nu utan padding men med vertikalt utrymme */}
                <div className="animate-fade-in space-y-8 py-8">
                    <WelcomeHeader user={user} />
                    <DashboardSummary projectCount={projects.length} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <ProjectList projects={projects} onNewProject={handleNewProject} />
                        </div>
                        <div>
                            <ActionSuggestions onNewProject={handleNewProject} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
