
'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Datastrukturen för fastighetsinformationen
interface PropertyData {
    fastighetsbeteckning: string;
    koordinater: { lat: number; lon: number; };
    adress: { gata: string; nummer: string; postort: string; postnummer: string; };
    tomtyta: number;
    taxeringsvärde: number;
}

interface PropertyLookupStepProps {
    onPropertySelect: (propertyData: PropertyData) => void;
}

export function PropertyLookupStep({ onPropertySelect }: PropertyLookupStepProps) {
    const [beteckning, setBeteckning] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!beteckning) return;

        setIsLoading(true);
        setError(null);
        setPropertyData(null);

        try {
            const response = await fetch(`/api/property-lookup/${beteckning}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Något gick fel vid sökningen.');
            }
            
            setPropertyData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="border border-gray-700/50 p-6 rounded-lg bg-gray-900/50">
            <h3 className="text-xl font-bold text-white mb-2">Hämta Fastighetsdata (Guldstandard)</h3>
            <p className="text-sm text-gray-400 mb-5">Ange fastighetsbeteckning för att automatiskt hämta data från Lantmäteriet. Detta lägger grunden för riskbedömningar och ROT-beräkningar.</p>
            
            <form onSubmit={handleLookup} className="flex items-start space-x-3">
                <input
                    type="text"
                    value={beteckning}
                    onChange={(e) => setBeteckning(e.target.value)}
                    placeholder="T.ex. Stockholm Inom Vallgraven 1:1"
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow duration-200"
                />
                <button 
                    type="submit"
                    disabled={isLoading || !beteckning}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ring-offset-gray-900 transition-colors duration-200"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : <MagnifyingGlassIcon className="h-5 w-5"/>}
                </button>
            </form>

            {error && <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}

            {propertyData && (
                <div className="mt-6">
                    <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-4">
                            <MapPinIcon className="h-8 w-8 text-cyan-400 mr-4"/>
                            <div>
                                <h4 className="text-2xl font-bold text-white">{propertyData.adress.gata} {propertyData.adress.nummer}</h4>
                                <p className="text-md text-gray-300">{propertyData.fastighetsbeteckning}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                           <div className="flex justify-between items-center"><span class="text-gray-400">Postort:</span><span class="font-semibold text-white">{propertyData.adress.postort}</span></div>
                           <div className="flex justify-between items-center"><span class="text-gray-400">Tomtyta:</span><span class="font-semibold text-white">{propertyData.tomtyta} m²</span></div>
                           <div className="flex justify-between items-center"><span class="text-gray-400">Taxeringsvärde:</span><span class="font-semibold text-white">{propertyData.taxeringsvärde.toLocaleString('sv-SE')} kr</span></div>
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <button 
                            onClick={() => onPropertySelect(propertyData)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-lg">
                            Använd denna fastighet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
