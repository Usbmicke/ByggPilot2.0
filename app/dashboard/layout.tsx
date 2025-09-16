
'use client';
import React from 'react';
import { useAuth } from '@/app/context/AuthContext'; // Importera useAuth
import { useRouter } from 'next/navigation'; // Importera useRouter
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import Chat from '@/app/components/chat/Chat';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <p>Laddar...</p>
            </div>
        );
    }

    if (!user) {
        router.push('/'); // Omdirigera till landningssidan
        return null;
    }
    
    const handleChatToggle = () => {
        console.log("Toggle chat");
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <AnimatedBackground />
            <Sidebar isDemo={!user} />
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
