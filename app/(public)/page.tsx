import React from 'react';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import Footer from '@/components/landing/Footer';
import AnimatedBackground from '@/components/landing/AnimatedBackground';

export default function LandingPage() {
  return (
    <div className="bg-gray-900 text-gray-200 font-sans antialiased relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <ProblemSection />
          <FeaturesSection />
          <TestimonialSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
