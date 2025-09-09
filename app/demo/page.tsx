
'use client';
import React, { useState } from 'react';

import DemoSidebar from './DemoSidebar'; 
import Chat from '@/app/components/chat/Chat';

// Importera alla demo-vyer
import DemoDashboardView from './views/DemoDashboardView';
import DemoProjectsView from './views/DemoProjectsView';
import DemoCustomersView from './views/DemoCustomersView';
import DemoTimeReportingView from './views/DemoTimeReportingView';
import DemoDocumentsView from './views/DemoDocumentsView';

// Definiera de vyer som finns i demon
export type DemoView = 'DASHBOARD' | 'PROJECTS' | 'DOCUMENTS' | 'CUSTOMERS' | 'TIME_REPORTING' | 'SETTINGS';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

// En simpel platshållarkomponent
const PlaceholderView = ({ title }: { title: string }) => (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400">Denna demovy är under utveckling.</p>
    </div>
);

export default function DemoPage() {
    // Sätt Översikt (DASHBOARD) som startvy
    const [activeView, setActiveView] = useState<DemoView>('DASHBOARD');
    const [isChatExpanded, setIsChatExpanded] = useState(false);

    const handleNavClick = (view: DemoView) => {
        setActiveView(view);
    };

    const renderView = () => {
        switch (activeView) {
            case 'DASHBOARD':
                return <DemoDashboardView />;
            case 'PROJECTS':
                return <DemoProjectsView />;
            case 'CUSTOMERS':
                return <DemoCustomersView />;
            case 'TIME_REPORTING':
                return <DemoTimeReportingView />;
            case 'DOCUMENTS':
                return <DemoDocumentsView />;
            case 'SETTINGS':
                return <PlaceholderView title="Inställningar" />;
            default:
                return <DemoDashboardView />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <AnimatedBackground />
            <DemoSidebar 
                activeView={activeView}
                onNavClick={handleNavClick} 
                onStartQuoteFlow={() => setIsChatExpanded(true)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                 {/* Header-komponenten är nu borttagen härifrån för ett renare gränssnitt */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
                    <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 text-center font-semibold rounded-lg p-2 mb-6">
                        <p>DU ÄR I DEMO-LÄGET. Ingen data sparas. <a href="/dashboard" className="underline hover:text-white">Klicka här för att logga in.</a></p>
                    </div>
                    {renderView()}
                </main>
                <Chat 
                    isExpanded={isChatExpanded} 
                    setExpanded={setIsChatExpanded}
                    startQuoteFlow={false}
                    onQuoteFlowComplete={() => {}}
                />
            </div>
        </div>
    );
};
