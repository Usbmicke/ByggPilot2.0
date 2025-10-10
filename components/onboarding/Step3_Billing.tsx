'use client';
import React, { useState, useTransition } from 'react';
import { updateBillingSettings } from '@/app/actions/onboardingActions';

// =================================================================================
// GULDSTANDARD: ONBOARDING STEG 3 - RECEPTBOKEN
// UI och logik för att sätta standard timpris och materialpåslag.
// =================================================================================

interface Step3BillingProps {
    onCompleted: () => void;
}

export default function Step3_Billing({ onCompleted }: Step3BillingProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        defaultHourlyRate: '550', // Förifyllt värde
        defaultMaterialMarkup: '15', // Förifyllt värde
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const hourlyRate = parseInt(formData.defaultHourlyRate, 10);
        const materialMarkup = parseInt(formData.defaultMaterialMarkup, 10);

        if (isNaN(hourlyRate) || isNaN(materialMarkup)) {
            setError('Vänligen ange giltiga nummer.');
            return;
        }

        startTransition(async () => {
            const result = await updateBillingSettings({ 
                defaultHourlyRate: hourlyRate,
                defaultMaterialMarkup: materialMarkup
            });
            if (result.success) {
                onCompleted();
            } else {
                setError(result.error || 'Ett okänt fel uppstod.');
            }
        });
    };

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Vänster sida (Motivation) */}
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-4">Kalkyler som stämmer. Varje gång.</h1>
                <p className="text-lg text-gray-300">
                    Världens bästa kalkylator är den som använder era siffror. Genom att ange ert timpris och påslag säkerställer ni att varje snabbkalkyl ni gör från och med nu är skräddarsydd för just er verksamhet och era marginaler.
                </p>
            </div>

            {/* Höger sida (Interaktion) */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label htmlFor="defaultHourlyRate" className="block text-sm font-medium text-gray-300 mb-2">Ange ert standard timpris (Snickare)</label>
                        <div className="relative">
                            <input type="number" name="defaultHourlyRate" id="defaultHourlyRate" value={formData.defaultHourlyRate} onChange={handleInputChange} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 pr-16" required />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">kr/tim</span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="defaultMaterialMarkup" className="block text-sm font-medium text-gray-300 mb-2">Ange ert standard materialpåslag</label>
                         <div className="relative">
                            <input type="number" name="defaultMaterialMarkup" id="defaultMaterialMarkup" value={formData.defaultMaterialMarkup} onChange={handleInputChange} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 pr-12" required />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">%</span>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                        {isPending ? 'Sparar...' : 'Nästa: Skapa ert första projekt'}
                    </button>
                </form>
            </div>
        </div>
    );
}
