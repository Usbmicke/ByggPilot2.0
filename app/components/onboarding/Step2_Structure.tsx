
'use client';

import { CheckCircleIcon } from '@heroicons/react/24/solid';

// =================================================================================
// ONBOARDING STEP 2 V1.0 - GULDSTANDARD
// DESIGN: Fokuserar på att bygga förtroende. Visar tydligt VAD som kommer att
// hända och ger en enkel, avsiktlig knapp för att initiera processen.
// =================================================================================

interface Step2Props {
    onNext: () => void;
    isSubmitting: boolean;
    companyName: string;
}

export default function Step2_Structure({ onNext, isSubmitting, companyName }: Step2Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Vänsterkolumn: Motivering */}
            <div className="pt-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Släpp papperskaoset. För alltid.</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Vi skapar nu en smart mappstruktur direkt i din Google Drive. Detta blir ditt företags nya, digitala hjärta – organiserat och tillgängligt överallt.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center"><CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> En central plats för alla projekt.</li>
                    <li className="flex items-center"><CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> Färdiga mappar för offerter, fakturor och KMA.</li>
                     <li className="flex items-center"><CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> Full äganderätt – all data lagras hos dig.</li>
                </ul>
            </div>

            {/* Högerkolumn: Interaktion */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg flex flex-col items-center justify-center text-center">
                 <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Din nya mappstruktur:</h4>
                <p className="font-mono bg-gray-200 dark:bg-gray-700 p-2 rounded-md my-4 text-gray-800 dark:text-gray-300">ByggPilot - {companyName}</p>
                
                <button
                    type="button"
                    onClick={() => onNext()}
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Skapar magi...
                        </>
                    ) : 'Skapa min smarta mappstruktur'}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Detta kan ta upp till 30 sekunder. Du behöver bara göra det en gång.</p>
            </div>
        </div>
    );
}
