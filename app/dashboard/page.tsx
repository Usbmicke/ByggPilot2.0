'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/Header';
import Chat from '@/app/components/chat/Chat';
import { Notification } from '@/app/types';
// import SettingsModal from '@/app/components/layout/SettingsModal'; // Skapas senare
// import ProTipsModal from '@/app/components/ProTipsModal'; // Finns på landningssidan
import { mockData } from '@/app/services/mockData';
import DashboardView from '@/app/components/views/DashboardView';
import ProjectsView from '@/app/components/views/ProjectsView';
import DocumentsView from '@/app/components/views/DocumentsView';
import CustomersView from '@/app/components/views/CustomersView';

export type View = 'DASHBOARD' | 'PROJECTS' | 'DOCUMENTS' | 'CUSTOMERS';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardPage() {
    const { isDemo } = useAuth();

    const [activeView, setActiveView] = useState<View>('DASHBOARD');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProTipsOpen, setIsProTipsOpen] = useState(false);
    const [isChatExpanded, setIsChatExpanded] = useState(false);

    // Settings state (kan flyttas till context senare)
    const [showWeatherWidget, setShowWeatherWidget] = useState(true);
    const [showTodoWidget, setShowTodoWidget] = useState(true);

    // Notification state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ type: string; data: any }[]>([]);

    const handleNavClick = (view: View) => {
        setActiveView(view);
        setIsChatExpanded(false);
        setSearchTerm(''); // Rensa sökning vid vybyte
    };

    // Simulera nya notiser för demo
    useEffect(() => {
        if (isDemo) {
            const interval = setInterval(() => {
                const newNotification: Notification = {
                    id: Date.now(),
                    text: `Familjen Nilsson har mailat om ev. ändringar kring kaklet i badrum 2.`,
                    read: false,
                };
                setNotifications(prev => [newNotification, ...prev]);
            }, 30000); // Ny notis var 30:e sekund

            return () => clearInterval(interval);
        }
    }, [isDemo]);
    
    const markNotificationsAsRead = () => {
        setTimeout(() => {
             setNotifications(notifications.map(n => ({...n, read: true})));
        }, 2000);
    };

    // Hantera sökning
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if (term.length < 2 || !isDemo) { // Sökning fungerar bara i demoläge
            setSearchResults([]);
            return;
        }

        const lowerCaseTerm = term.toLowerCase();
        const results: { type: string; data: any }[] = [];

        mockData.projects.forEach(p => {
            if (p.name.toLowerCase().includes(lowerCaseTerm) || p.customer.name.toLowerCase().includes(lowerCaseTerm)) {
                results.push({ type: 'Projekt', data: p });
            }
        });
        mockData.customers.forEach(c => {
            if (c.name.toLowerCase().includes(lowerCaseTerm) || c.contactPerson.toLowerCase().includes(lowerCaseTerm)) {
                results.push({ type: 'Kund', data: c });
            }
        });
        mockData.projects.flatMap(p => p.documents).forEach(d => {
            if (d.name.toLowerCase().includes(lowerCaseTerm)) {
                 results.push({ type: 'Dokument', data: d });
            }
        });

        setSearchResults(results);
    }, [isDemo]);

    const renderView = () => {
        const data = isDemo ? mockData : { projects: [], customers: [], contacts: [] };

        switch (activeView) {
            case 'PROJECTS':
                return <ProjectsView projects={data.projects} />;
            case 'DOCUMENTS':
                return <DocumentsView projects={data.projects} />;
            case 'CUSTOMERS':
                return <CustomersView customers={data.customers} projects={data.projects} />;
            case 'DASHBOARD':
            default:
                return <DashboardView 
                            projects={data.projects} 
                            showWeather={showWeatherWidget}
                            showTodo={showTodoWidget}
                        />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <AnimatedBackground />
            <Sidebar 
                activeView={activeView}
                onNavClick={handleNavClick} 
                onSettingsClick={() => alert('Inställningar kommer snart!')} //setIsSettingsOpen(true)
                onProTipsClick={() => alert('ProTips kommer snart!')} //setIsProTipsOpen(true)
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    notifications={notifications}
                    isNotificationsOpen={isNotificationsOpen}
                    onNotificationsToggle={() => {
                        setIsNotificationsOpen(!isNotificationsOpen);
                        if (!isNotificationsOpen) {
                            markNotificationsAsRead();
                        }
                    }}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    searchResults={searchResults}
                    onCloseSearch={() => setSearchTerm('')}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
                    {renderView()}
                </main>
                <Chat isExpanded={isChatExpanded} setExpanded={setIsChatExpanded} />
            </div>
            {/* Modaler kommer implementeras senare
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                showWeather={showWeatherWidget}
                setShowWeather={setShowWeatherWidget}
                showTodo={showTodoWidget}
                setShowTodo={setShowTodoWidget}
            />
             <ProTipsModal 
                isOpen={isProTipsOpen} 
                onClose={() => setIsProTipsOpen(false)}
            />
            */}
        </div>
    );
};