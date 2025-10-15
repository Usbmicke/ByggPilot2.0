
'use client';

import React, { useState, useEffect } from 'react'; // Importera useEffect
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation'; // Importera useRouter
import GuidedTour from '@/components/tour/GuidedTour';
import ChatBanner from '@/components/layout/ChatBanner';

// =================================================================================
// DASHBOARD LAYOUT V2.0 - ONBOARDING GUARD
// REVIDERING:
// 1. **Importerat `useEffect` och `useRouter`:** Nödvändiga hooks för att hantera
//    logik efter rendering och för att kunna omdirigera användaren.
// 2. **Lagt till Onboarding-skydd:** En `useEffect`-hook har implementerats.
//    Denna hook kontrollerar `session.user.onboardingComplete`-flaggan.
//    Om flaggan är `false`, tvingas användaren omedelbart till `/onboarding`,
//    vilket löser det kritiska flödesfelet.
// =================================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter(); // Initiera routern

  // NYTT: Onboarding-skydd
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !session.user.onboardingComplete) {
      router.push('/onboarding');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        Laddar session...
      </div>
    );
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && !session.user.onboardingComplete)) {
    // Visar ett tomt state eller en loader medan omdirigering sker för att undvika "flash"
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
            Omdirigerar...
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-[65px]">
            {children}
            <ChatBanner />
        </main>
      </div>

      <GuidedTour />
    </div>
  );
}
