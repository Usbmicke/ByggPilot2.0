
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import Chat from './chat/Chat';
import { Notification } from '../types';
import SettingsModal from './layout/SettingsModal';
import { mockData } from '../services/mockData';
import DashboardView from './views/DashboardView';
import ProjectsView from './views/ProjectsView';
import DocumentsView from './views/DocumentsView';
import CustomersView from './views/CustomersView';
import ProTipsModal from './ProTipsModal';

export type View = 'DASHBOARD' | 'PROJECTS' | 'DOCUMENTS' | 'CUSTOMERS';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

const Dashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('DASHBOARD');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProTipsOpen, setIsProTipsOpen] = useState(false);
    const [isChatExpanded, setIsChatExpanded] = useState(false);

    // Settings state
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
        setSearchTerm(''); // Clear search when changing views
    };

    // Simulate new notifications
    useEffect(() => {
        const interval = setInterval(() => {
            const newNotification: Notification = {
                id: Date.now(),
                text: `Familjen Nilsson har mailat om ev. ändringar kring kaklet i badrum 2.`,
                read: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
        }, 30000); // New notification every 30 seconds

        return () => clearInterval(interval);
    }, []);
    
    const markNotificationsAsRead = () => {
        setTimeout(() => {
             setNotifications(notifications.map(n => ({...n, read: true})));
        }, 2000);
    };

    // Handle search
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        const lowerCaseTerm = term.toLowerCase();
        const results: { type: string; data: any }[] = [];

        // Search projects
        mockData.projects.forEach(p => {
            if (p.name.toLowerCase().includes(lowerCaseTerm) || p.customer.name.toLowerCase().includes(lowerCaseTerm)) {
                results.push({ type: 'Projekt', data: p });
            }
        });

        // Search customers
        mockData.customers.forEach(c => {
            if (c.name.toLowerCase().includes(lowerCaseTerm) || c.contactPerson.toLowerCase().includes(lowerCaseTerm)) {
                results.push({ type: 'Kund', data: c });
            }
        });
        
        // Search documents
        mockData.projects.flatMap(p => p.documents).forEach(d => {
            if (d.name.toLowerCase().includes(lowerCaseTerm)) {
                 results.push({ type: 'Dokument', data: d });
            }
        });

        setSearchResults(results);
    }, []);

    const renderView = () => {
        switch (activeView) {
            case 'PROJECTS':
                return <ProjectsView projects={mockData.projects} />;
            case 'DOCUMENTS':
                return <DocumentsView projects={mockData.projects} />;
            case 'CUSTOMERS':
                return <CustomersView customers={mockData.customers} projects={mockData.projects} />;
            case 'DASHBOARD':
            default:
                return <DashboardView 
                            projects={mockData.projects} 
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
                onSettingsClick={() => setIsSettingsOpen(true)}
                onProTipsClick={() => setIsProTipsOpen(true)}
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
        </div>
    );
};

export default Dashboard;
