'use client';

import React, { useState, useEffect } from 'react';

// Kärnbudskapen, direkt inspirerade av Masterplanen.
const manifestTexts = [
  {
    line1: "Från papperskaos i bilen...",
    line2: "...till digital ordning i molnet."
  },
  {
    line1: "Ditt digitala kontor.",
    line2: "Alltid redo, alltid sökbart."
  },
  {
    line1: "Skapa riskanalyser & offerter.",
    line2: "Direkt från rätt projektmapp."
  },
  {
    line1: "Byggd på säkerheten från Google.",
    line2: "Dina filer. Ditt konto."
  },
  {
    line1: "Fokusera på hantverket.",
    line2: "Jag sköter administrationen."
  }
];

export const OnboardingAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Skapar en intervall för att byta budskap med en mjuk övergång.
    const interval = setInterval(() => {
      setIsVisible(false); // Startar uttoning
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % manifestTexts.length);
        setIsVisible(true); // Startar intoning med nästa budskap
      }, 750); // Väntar tills uttoningen är klar.
    }, 5000); // Byt budskap var 5:e sekund.

    return () => clearInterval(interval);
  }, []);

  const currentText = manifestTexts[currentIndex];

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
      {/* En subtil, pulserande ljuskälla som ger liv åt vyn. */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-8">
          Din Proaktiva Kollega
        </h2>
        
        {/* En container med fast höjd förhindrar att layouten 'hoppar' mellan byten. */}
        <div className="h-24">
          <div 
            className={`transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="text-2xl lg:text-3xl font-light text-gray-200">
              {currentText.line1}
            </p>
            <p className="text-2xl lg:text-3xl font-semibold text-gray-50 mt-1">
              {currentText.line2}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
