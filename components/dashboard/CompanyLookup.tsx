'use client';

import { useState } from 'react';
import { BuildingOffice2Icon, ExclamationTriangleIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Typdefinition för svarsdatan från vårt API
interface CompanyData {
    orgnr: string;
    companyName: string;
    isVatRegistered: boolean;
    hasFtax: boolean;
    address: {
        street: string;
        zipCode: string;
        city: string;
    };
}

export function CompanyLookup() {
    const [orgnr, setOrgnr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault(); // Förhindra att sidan laddas om
        if (!orgnr) return;

        setIsLoading(true);
        setError(null);
        setCompanyData(null);

        try {
            const response = await fetch(`/api/company-lookup/${orgnr}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Något gick fel vid sökningen.');
            }
            
            setCompanyData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Verifiera företag</h3>
            <form onSubmit={handleLookup} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={orgnr}
                    onChange={(e) => setOrgnr(e.target.value)}
                    placeholder="Ange organisationsnummer..."
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button 
                    type="submit"
                    disabled={isLoading || !orgnr}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ring-offset-gray-800"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Söker...
                        </>
                    ) : <><MagnifyingGlassIcon className="-ml-1 mr-2 h-5 w-5"/>Sök</>}
                </button>
            </form>

            {error && <div className="mt-4 bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}

            {companyData && (
                <div className="mt-6 bg-gray-900/70 p-5 rounded-lg border border-gray-700">
                    <div className="flex items-center mb-4">
                        <BuildingOffice2Icon className="h-8 w-8 text-gray-400 mr-4"/>
                        <h4 className="text-2xl font-bold text-white">{companyData.companyName}</h4>
                    </div>
                    <div className="space-y-3">
                        <div className={`flex items-center p-3 rounded-md ${companyData.hasFtax ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {companyData.hasFtax ? <CheckCircleIcon className='h-6 w-6 text-green-400 mr-3'/> : <ExclamationTriangleIcon className='h-6 w-6 text-red-400 mr-3'/>}
                            <div>
                                <p className={`font-semibold ${companyData.hasFtax ? 'text-green-300' : 'text-red-300'}`}>
                                    {companyData.hasFtax ? 'Godkänd för F-skatt' : 'Ej godkänd för F-skatt'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {companyData.hasFtax ? 'Företaget är godkänt för F-skatt.' : 'Varning! Detta företag är inte godkänt för F-skatt.'}
                                </p>
                            </div>
                        </div>
                         <div className={`flex items-center p-3 rounded-md ${companyData.isVatRegistered ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                            {companyData.isVatRegistered ? <CheckCircleIcon className='h-6 w-6 text-green-400 mr-3'/> : <ExclamationTriangleIcon className='h-6 w-6 text-yellow-400 mr-3'/>}
                            <div>
                                <p className={`font-semibold ${companyData.isVatRegistered ? 'text-green-300' : 'text-yellow-300'}`}>
                                    {companyData.isVatRegistered ? 'Registrerad för moms' : 'Ej registrerad för moms'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {companyData.isVatRegistered ? 'Företaget är registrerat för moms.' : 'Obs! Detta företag är inte registrerat för moms.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
