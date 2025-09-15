
'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header'; // Korrigerad sökväg
import Chat from '@/app/components/chat/Chat';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const isDemo = !session;

    const notifications = isDemo ? [] : [];
    
    const handleChatToggle = () => {
        // Lägg till logik för att visa/dölja chatten här
        console.log("Toggle chat");
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <AnimatedBackground />
            <Sidebar isDemo={isDemo} />
            <div className="flex flex-1 flex-col overflow-hidden">
                 <Header onChatToggle={handleChatToggle} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
            <Chat />
        </div>
    );
}
