'use client';
import React from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import Chat from '@/app/components/chat/Chat';
import AuthGuard from '@/app/components/AuthGuard'; // Importera den nya AuthGuard

// Denna bakgrundskomponent är endast för visuell estetik.
const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    
    // Dummy-funktion för chatt-knappen, kan utökas senare.
    const handleChatToggle = () => {
        console.log("Toggle chat");
    };

    return (
        <AuthGuard> {/* Omslut hela layouten med AuthGuard */}
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                <AnimatedBackground />
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header onChatToggle={handleChatToggle} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        {children} 
                    </main>
                </div>
                <Chat />
            </div>
        </AuthGuard>
    );
}
