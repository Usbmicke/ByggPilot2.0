
'use client';

import React, { useState } from 'react';
import { PropertyLookupStep } from './steps/PropertyLookupStep';
import { ArrowLeftIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

// Datastrukturen för fastighetsinformationen
interface PropertyData {
    fastighetsbeteckning: string;
    koordinater: { lat: number; lon: number; };
    adress: { gata: string; nummer: string; postort: string; postnummer: string; };
    tomtyta: number;
    taxeringsvärde: number;
}

// Stegen i offert-guiden
type Step = 'propertyLookup' | 'defineScope' | 'confirm';

export const CreateOfferModal = () => {
  const [step, setStep] = useState<Step>('propertyLookup');
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

  // Denna funktion tar emot datan från PropertyLookupStep
  const handlePropertySelect = (data: PropertyData) => {
    setPropertyData(data);
    setStep('defineScope'); // Gå vidare till nästa steg
  };

  const handleBack = () => {
      setStep('propertyLookup');
      setPropertyData(null);
  }

  const renderStep = () => {
    switch (step) {
      case 'propertyLookup':
        return (
            <PropertyLookupStep onPropertySelect={handlePropertySelect} />
        );

      case 'defineScope':
        return (
          <div>
            <button onClick={handleBack} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Byt Fastighet
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Definiera Arbete</h2>
            <p className="text-gray-400 mb-6">Nu när fastigheten är vald, beskriv arbetet som ska utföras för <span className='font-bold text-cyan-300'>{propertyData?.adress.gata} {propertyData?.adress.nummer}</span>.</p>
            
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg text-center">
                <BuildingStorefrontIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Nästa Steg: Offert-generator</h3>
                <p className="text-gray-400">Här kommer vi att bygga själva offert-generatorn, där du kan lägga till arbetsmoment, material och se en sammanställning. Fastighetsdatan vi just hämtade kommer att vara tillgänglig här för ROT-avdrag och andra beräkningar.</p>
            </div>
        </div>
        )

      default:
        return <p>Okänt steg</p>;
    }
  };

  return (
    <div>
        <h1 className="text-3xl font-bold text-white mb-6 border-b-2 border-cyan-700 pb-2">Skapa Ny Offert</h1>
        {renderStep()}
    </div>
  );
};
