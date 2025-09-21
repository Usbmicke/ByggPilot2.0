
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import ChatWidget from '@/app/components/layout/ChatWidget';
import AnimatedBackground from '@/app/components/layout/AnimatedBackground';

interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Laddar din session...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/api/auth/signin');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <AnimatedBackground />
            <Sidebar />
            
            <div className="md:pl-64"> 
                <Header />
                
                <main className="pt-20">
                    <div className="grid justify-center pt-24 px-4">
                        {children}
                    </div>
                </main>
            </div>

            <ChatWidget userProfile={null} />
        </div>
    );
}
