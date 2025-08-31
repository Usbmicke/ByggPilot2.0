// Plats: /app/(public)/page.tsx
import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ProblemSection from './components/ProblemSection';
import TrustSection from './components/TrustSection';
import Footer from './components/Footer'; // Ny import

export default function LandingPage() {
  return (
    <div className="bg-brand-dark text-brand-text flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <ProblemSection />
        <TrustSection />
      </main>
      <Footer /> {/* Ny komponent tillagd */}
    </div>
  );
}
