'use client';
import React, { useState, useTransition } from 'react';
import { updateCompanyProfile } from '@/app/actions/onboardingActions';

// =================================================================================
// GULDSTANDARD: ONBOARDING STEG 1 - FÖRETAGSPROFIL
// Implementerar UI och logik för det första steget i onboarding-flödet.
// Använder Server Action för att spara data och hanterar state för formuläret.
// =================================================================================

interface Step1ProfileProps {
    onCompleted: () => void; // Funktion för att gå till nästa steg
}

export default function Step1_Profile({ onCompleted }: Step1ProfileProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        orgNumber: '',
        address: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.companyName) {
            setError('Företagsnamn är obligatoriskt.');
            return;
        }

        startTransition(async () => {
            const result = await updateCompanyProfile(formData);
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
                <h1 className="text-4xl font-bold text-white mb-4">Professionella dokument, automatiskt.</h1>
                <p className="text-lg text-gray-300">
                    Informationen du fyller i här används för att automatiskt skapa snygga, korrekta offerter, fakturor och projektunderlag med er logotyp. Fyll i en gång, spara tid för alltid.
                </p>
                {/* Här kan en framtida animation/grafik placeras */}
            </div>

            {/* Höger sida (Interaktion) */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">Företagsnamn</label>
                        <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="orgNumber" className="block text-sm font-medium text-gray-300 mb-2">Organisationsnummer</label>
                        <input type="text" name="orgNumber" id="orgNumber" value={formData.orgNumber} onChange={handleInputChange} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">Adress</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleInputChange} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500" />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                        {isPending ? 'Sparar...' : 'Nästa: Automatisera er projektstruktur'}
                    </button>
                </form>
            </div>
        </div>
    );
}
