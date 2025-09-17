'use client';
import React from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import Header from '@/app/components/layout/Header';
import AuthGuard from '@/app/components/AuthGuard';
import Providers from '@/app/components/Providers';

const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
    </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <AuthGuard>
                <div className="h-screen bg-gray-900 text-white flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 overflow-hidden">
                            {children}
                        </main>
                    </div>
                </div>
            </AuthGuard>
        </Providers>
    );
}
