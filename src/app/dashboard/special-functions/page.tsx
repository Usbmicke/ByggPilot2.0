
import React from 'react';
import AudioToAtaCard from '@/components/special-functions/AudioToAtaCard';
import SpillAnalysisCard from '@/components/special-functions/SpillAnalysisCard';
import QuoteGeneratorCard from '@/components/special-functions/QuoteGeneratorCard';
import Sie4GeneratorCard from '@/components/special-functions/Sie4GeneratorCard';

const SpecialFunctionsPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Specialfunktioner</h1>
      <p className="text-lg text-gray-600 mb-8">Avancerade AI-drivna verktyg från 2025 Vision för att optimera ditt arbetsflöde.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AudioToAtaCard />
        <SpillAnalysisCard />
        <QuoteGeneratorCard />
        <Sie4GeneratorCard />
      </div>
    </div>
  );
};

export default SpecialFunctionsPage;
