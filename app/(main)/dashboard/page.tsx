'use client';

import React, { useState } from 'react';
// Korrigerade importer med { }
import { WelcomeHeader } from '@/app/components/dashboard/WelcomeHeader';
import DashboardSummary from '@/app/components/dashboard/DashboardSummary';
import { ProjectList } from '@/app/components/dashboard/ProjectList';
import { ActionSuggestions } from '@/app/components/dashboard/ActionSuggestions';
import ZeroState from '@/app/components/dashboard/ZeroState';

// Importera den nya, kraftfulla modalen för att skapa projekt
import CreateProjectModal from '@/app/components/dashboard/CreateProjectModal';

// Exempeldata, i en riktig app skulle detta komma från ett API
const projects = [
    { id: '1', name: 'Renovering kök, familjen Andersson', status: 'Pågående', lastActivity: '2 timmar sedan' },
    { id: '2', name: 'Altanbygge, Brf. Solsidan', status: 'Väntar på kund', lastActivity: '1 dag sedan' },
    { id: '3', name: 'Stambyte, HSB Stockholm', status: 'Planerad', lastActivity: '3 dagar sedan' },
];

export default function DashboardPage() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    
    // State för att kontrollera synligheten av vår nya modal
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    const user = { name: 'Sven' }; // Exempelanvändare

    // Funktion för att hantera klick på "Nytt Projekt"-knappen
    const handleNewProject = () => {
        setIsCreateProjectModalOpen(true);
    };

    if (showOnboarding) {
        return <ZeroState onFinished={() => setShowOnboarding(false)} />;
    }

    return (
        <>
            {/* Lägg till modal-komponenten här. Den är osynlig tills `isOpen` är true. */}
            <CreateProjectModal 
                isOpen={isCreateProjectModalOpen} 
                onClose={() => setIsCreateProjectModalOpen(false)} 
            />

            <div className="p-4 sm:p-6 md:p-8 animate-fade-in space-y-8">
                <WelcomeHeader user={user} />
                <DashboardSummary projectCount={projects.length} />
                
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-2/3">
                         <ProjectList projects={projects} onNewProject={handleNewProject} />
                    </div>
                    <div className="w-full md:w-1/3">
                        <ActionSuggestions onNewProject={handleNewProject} />
                    </div>
                </div>
            </div>
        </>
    );
}
