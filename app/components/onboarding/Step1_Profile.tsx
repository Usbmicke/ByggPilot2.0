
'use client';

import { useState } from "react";

// =================================================================================
// ONBOARDING STEP 1 V1.0 - GULDSTANDARD
// DESIGN: Tvåkolumnslayout. Till vänster: Motiverande text som förklarar VARFÖR
// detta steg är viktigt. Till höger: Rena, tydliga input-fält.
// =================================================================================

interface Step1Props {
    onNext: (data: { companyName: string; orgNumber?: string; address?: string }) => void;
    isSubmitting: boolean;
}

export default function Step1_Profile({ onNext, isSubmitting }: Step1Props) {
    const [companyName, setCompanyName] = useState('');

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (companyName.trim()) {
            onNext({ companyName });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Vänsterkolumn: Motivering */}
            <div className="pt-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Berätta om ditt företag</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Allt börjar med ditt företagsnamn. Detta namn kommer att användas för att skapa din personliga mappstruktur i Google Drive och kommer att synas på dina framtida offerter och fakturor.
                </p>
                 <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    Du kan lägga till organisationsnummer och adress senare om du vill.
                </p>
            </div>

            {/* Högerkolumn: Interaktion */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <form onSubmit={handleNext}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Företagsnamn</label>
                            <input
                                type="text"
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Din Byggfirma AB"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting || !companyName.trim()}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                        >
                            {isSubmitting ? 'Sparar...' : 'Nästa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
