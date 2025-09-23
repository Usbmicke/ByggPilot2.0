'use client';

import React from 'react';
import CalculationEngine from '@/app/components/dashboard/CalculationEngine';

// Provisorisk sida för att skapa en ny offert/kalkyl.

export default function NewOfferPage() {

    // TODO: Detta måste lösas. CalculationEngine behöver ett projectId.
    // Ett nytt projekt måste skapas FÖRST, och sedan ska användaren
    // navigeras hit med det nya projektets ID.
    const temporaryProjectId = "temp_project_id_12345"; // Hårdkodat för nu

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-700 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-6">Skapa ny offert</h1>
                <p className="text-gray-400 mb-8">I ett färdigt flöde skulle ett projekt-ID skapas först. För nu använder vi ett temporärt ID för att kunna bygga och testa kalkylatorn.</p>
                 <CalculationEngine projectId={temporaryProjectId} />
            </div>
        </div>
    );
}
