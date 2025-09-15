'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react'; // Byt till next-auth
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/Header';
import Chat from '@/app/components/chat/Chat';
import { Notification } from '@/app/types';
import { mockData } from '@/app/services/mockData';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // ANVÄND useSession för att avgöra demoläge eller riktig data
    const { data: session } = useSession();
    const isDemo = !session; // Enkel logik: om ingen session, kör demo

    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ type: string; data: any }[]>([]);

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

        setSearchResults(results);
    }, [isDemo]);

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <AnimatedBackground />
            <Sidebar />
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
                    {children} 
                </main>
                <Chat isExpanded={isChatExpanded} setExpanded={setIsChatExpanded} />
            </div>
        </div>
    );
}