'use client';

import React from 'react';

const TrustSection = () => {
  // I en verklig app skulle dessa logotyper komma från ett CMS eller en API.
  const logos = [
    { name: 'Företag A', logo: '/logo-placeholder.svg' }, // Använd en placeholder SVG
    { name: 'Företag B', logo: '/logo-placeholder.svg' },
    { name: 'Företag C', logo: '/logo-placeholder.svg' },
    { name: 'Företag D', logo: '/logo-placeholder.svg' },
    { name: 'Företag E', logo: '/logo-placeholder.svg' },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white">Används av ledande utvecklingsteam</h2>
          <div className="flex justify-center items-center mt-8 space-x-8">
            {logos.map((company, index) => (
              <div key={index} className="grayscale opacity-60 hover:opacity-100 transition-opacity">
                {/* Riktig bild-tagg skulle användas här, t.ex. <Image> från next/image */}
                <span className="text-gray-400">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-16">
          <h3 className="text-4xl font-bold text-white">Är du redo att revolutionera din utvecklingsprocess?</h3>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Gå med i hundratals utvecklare som redan bygger snabbare, smartare och mer konsekvent med ByggPilot.</p>
          <button className="mt-8 bg-brand-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-primary-dark transition-colors">
            Börja din resa nu
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
