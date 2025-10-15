
'use client';

import { useState } from "react";

// =================================================================================
// ONBOARDING STEP 3 V1.0 - GULDSTANDARD
// DESIGN: Fokuserar på effektivitet. Ger användaren möjlighet att ställa in
// standardvärden som kommer att spara tid i framtiden.
// =================================================================================

interface Step3Props {
    onNext: (data: { defaultHourlyRate: number; defaultMaterialMarkup: number }) => void;
    isSubmitting: boolean;
}

export default function Step3_Rates({ onNext, isSubmitting }: Step3Props) {
    const [hourlyRate, setHourlyRate] = useState('550');
    const [materialMarkup, setMaterialMarkup] = useState('15');

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        const rate = parseFloat(hourlyRate);
        const markup = parseFloat(materialMarkup);
        if (!isNaN(rate) && !isNaN(markup)) {
            onNext({ defaultHourlyRate: rate, defaultMaterialMarkup: markup });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Vänsterkolumn: Motivering */}
            <div className="pt-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Effektivisera din prissättning</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Ställ in dina standardpriser här så slipper du mata in dem för varje nytt projekt. Detta är din "receptbok" för lönsamhet.
                </p>
                 <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    Dessa värden används som standard när du skapar nya projekt, men du kan alltid justera dem från fall till fall.
                </p>
            </div>

            {/* Högerkolumn: Interaktion */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <form onSubmit={handleNext}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Standardtimpris (ex. moms)</label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    id="hourlyRate"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(e.target.value)}
                                    className="block w-full px-3 py-2 pr-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="550"
                                    required
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                     <span className="text-gray-500 dark:text-gray-400 sm:text-sm">kr/tim</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="materialMarkup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Materialpåslag</label>
                             <div className="relative mt-1">
                                <input
                                    type="number"
                                    id="materialMarkup"
                                    value={materialMarkup}
                                    onChange={(e) => setMaterialMarkup(e.target.value)}
                                    className="block w-full px-3 py-2 pr-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="15"
                                    required
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                     <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
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
