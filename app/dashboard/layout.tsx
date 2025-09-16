'use client';
import React from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import AuthGuard from '@/app/components/AuthGuard';
import ChatWidget from '@/app/components/layout/ChatWidget';
import Providers from '@/app/components/Providers'; // Importera den nya providern

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        // Steg 1: Omslut hela layouten med Providers för att ge tillgång till sessionen
        <Providers>
            {/* Steg 2: AuthGuard skyddar hela dashboarden som det var tänkt */}
            <AuthGuard>
                <div className="h-screen bg-gray-900">
                    <AnimatedBackground />
                    <Sidebar />
                    <Header />
                    
                    <main className="ml-64 pt-20 h-full overflow-y-auto">
                        <div className="p-4 md:p-6 lg:p-8">
                            {children}
                        </div>
                    </main>

                    <ChatWidget />
                </div>
            </AuthGuard>
        </Providers>
    );
}
