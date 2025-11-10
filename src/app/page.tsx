'use client'; // Gör om till en Client Component

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "@/lib/firebase/client"; // Antar att denna fil finns för Firebase initiering
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ThreeCanvas from '@/components/landing/ThreeCanvas';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import FounderSection from '@/components/landing/FounderSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Funktion för att anropa vår Genkit backend
  const callGenkit = async () => {
    setLoading(true);
    try {
      const functions = getFunctions(firebaseApp, 'europe-west1');
      // Korrekt namn på funktionen är menuSuggestion
      const menuSuggestionFunction = httpsCallable(functions, 'menuSuggestion');
      const response = await menuSuggestionFunction('ByggPilot Frontend');
      const data = response.data as string;
      console.log('Svar från Genkit:', data);
      setResult(data);
    } catch (error) {
      console.error("Fel vid anrop till Genkit:", error);
      setResult('Ett fel uppstod.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-950">
       {/* Test-knapp för Genkit - Placeras synligt för testning */}
      <div className="relative z-50 p-4 bg-gray-800 border-b border-cyan-500">
          <h3 className="text-white">Genkit Testkontroll</h3>
          <button onClick={callGenkit} disabled={loading} className="bg-cyan-600 text-white px-4 py-2 rounded-md">
              {loading ? 'Anropar...' : 'Testa Genkit Anrop'}
          </button>
          {result && <p className="text-white mt-2">Resultat: <span className="font-mono bg-gray-700 p-1 rounded">{result}</span></p>}
      </div>

      <div className="fixed top-0 left-0 w-full h-full -z-0">
        <ThreeCanvas />
      </div>
       <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-10" 
        style={{ background: 'radial-gradient(circle at center, rgba(10, 10, 10, 0) 40%, rgba(10, 10, 10, 1) 90%)' }}
      ></div>
      
      <div className="relative z-20">
        <Header />
        <main>
          <Hero />
          <ProblemSection />
          <SolutionSection />
          <FounderSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
