
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import LandingPageHeader from '@/components/landing/LandingPageHeader';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import FeatureSection from '@/components/landing/FeatureSection';
import VideoSection from '@/components/landing/VideoSection';
import ProTipsSection from '@/components/landing/ProTipsSection';
import FounderSection from '@/components/landing/FounderSection';
import LandingPageFooter from '@/components/landing/LandingPageFooter';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import KnowledgeBaseModal from '@/components/modals/KnowledgeBaseModal';

// --- HUVUDLAYOUT ---_V2
export default function LandingPage() {
  const [isKnowledgeBaseModalOpen, setKnowledgeBaseModalOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);
  
  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-gray-300 animate-pulse">Ansluter...</div>
        </div>
    );
  }

  return (
    <div className="text-gray-200 font-sans bg-gray-900">
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        <LandingPageHeader />

        <main className="flex-grow">
          <HeroSection />
          <ProblemSection />
          <VideoSection />
          <FeatureSection />
          <ProTipsSection onOpenKnowledgeBase={() => setKnowledgeBaseModalOpen(true)} />
          <FounderSection />
        </main>
        
        <LandingPageFooter />
      </div>

      <KnowledgeBaseModal isOpen={isKnowledgeBaseModalOpen} onClose={() => setKnowledgeBaseModalOpen(false)} />
    </div>
  );
}
