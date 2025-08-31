'use client';

import React from 'react';
import FeatureCard from './FeatureCard';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Automatiserad Projektstruktur',
      description: 'Skapa en optimerad mappstruktur och grundläggande kod med ett enda klick, vilket sparar timmar av manuellt arbete.',
    },
    {
      title: 'Dynamisk Kodgenerering',
      description: 'Generera komponenter, sidor och funktioner baserat på dina specifikationer. Säg adjö till repetitiv kodskrivning.',
    },
    {
      title: 'Integrerad Google Drive',
      description: 'Synkronisera din projektstruktur direkt med Google Drive för sömlös fildelning och samarbete.',
    },
    {
      title: 'AI-driven Chattassistans',
      description: 'Få omedelbar hjälp och kodförslag från en AI-assistent som förstår din kodbas och dina mål.',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">Funktioner</h2>
          <p className="text-gray-400 mt-2">Allt du behöver för att starta och hantera ditt projekt effektivt.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
