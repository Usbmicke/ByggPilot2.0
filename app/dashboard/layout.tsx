
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GuidedTour from '@/components/tour/GuidedTour';
import IntegratedChat from '@/app/components/IntegratedChat'; // KORRIGERAD SÖKVÄG

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

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
        </main>
      </div>

      <IntegratedChat />
      <GuidedTour />
    </div>
  );
}
