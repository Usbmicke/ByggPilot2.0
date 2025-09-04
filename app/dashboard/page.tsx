'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import Chat from '@/app/components/chat/Chat';
import { Notification } from '@/app/types';
import { mockProjects, mockTodos, mockNotifications, mockCustomers } from '@/app/services/mockData';
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
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [startQuoteFlow, setStartQuoteFlow] = useState(false);

    // Settings state
    const [showWeatherWidget, setShowWeatherWidget] = useState(true);
    const [showTodoWidget, setShowTodoWidget] = useState(true);

    // Notification state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ type: string; data: any }[]>([]);

    useEffect(() => {
        if (isDemo) {
            setNotifications(mockNotifications);
        }
    }, [isDemo]);

    const handleNavClick = (view: View) => {
        setActiveView(view);
        setIsChatExpanded(false);
        setSearchTerm('');
    };

    const handleStartQuoteFlow = () => {
        if (!isDemo) {
            // Hantera live-läge senare
            alert('Denna funktion är endast tillgänglig i demoläget just nu.');
            return;
        }
        setStartQuoteFlow(true);
        setIsChatExpanded(true);
    };
    
    const markNotificationsAsRead = () => {
        setTimeout(() => {
             setNotifications(notifications.map(n => ({...n, read: true})));
        }, 2000);
    };

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if (term.length < 2 || !isDemo) {
            setSearchResults([]);
            return;
        }

        const lowerCaseTerm = term.toLowerCase();
        const results: { type: string; data: any }[] = [];

        mockProjects.forEach(p => {
            if (p.name.toLowerCase().includes(lowerCaseTerm) || p.customer.name.toLowerCase().includes(lowerCaseTerm)) {
                results.push({ type: 'Projekt', data: p });
            }
            p.documents.forEach(d => {
                if (d.name.toLowerCase().includes(lowerCaseTerm)) {
                     results.push({ type: 'Dokument', data: { ...d, projectName: p.name } });
                }
            });
        });

        mockCustomers.forEach(c => {
            if (c.name.toLowerCase().includes(lowerCaseTerm) || c.contactPerson.toLowerCase().includes(lowerCaseTerm)) {
                results.push({ type: 'Kund', data: c });
            }
        });

        setSearchResults(results);
    }, [isDemo]);

    const renderView = () => {
        const data = isDemo 
            ? { projects: mockProjects, customers: mockCustomers, todos: mockTodos } 
            : { projects: [], customers: [], todos: [] };

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
                            todos={data.todos}
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
                onStartQuoteFlow={handleStartQuoteFlow}
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
                <Chat 
                    isExpanded={isChatExpanded} 
                    setExpanded={setIsChatExpanded}
                    startQuoteFlow={startQuoteFlow}
                    onQuoteFlowComplete={() => setStartQuoteFlow(false)}
                />
            </div>
        </div>
    );
};