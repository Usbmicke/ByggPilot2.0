'use client';
import React from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import AuthGuard from '@/app/components/AuthGuard';
import ChatWidget from '@/app/components/layout/ChatWidget';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="h-screen bg-gray-900">
                <AnimatedBackground />
                <Sidebar />
                <Header />
                
                {/* HUVUDOMBYGGNAD: `main` är nu en scrollbar container som är korrekt
                    positionerad med padding för att undvika de fasta sido- och toppmenyerna. */}
                <main className="ml-64 pt-20 h-full overflow-y-auto">
                    {/* Innehållet har sin egen padding för luftighet */}
                    <div className="p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>

                <ChatWidget />
            </div>
        </AuthGuard>
    );
}
