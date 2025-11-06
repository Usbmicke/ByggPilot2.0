
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

interface CompanyLookupStepProps {
    onCompanySelect: (companyData: CompanyData) => void;
}

export function CompanyLookupStep({ onCompanySelect }: CompanyLookupStepProps) {
    const [orgnr, setOrgnr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="border border-gray-700/50 p-6 rounded-lg bg-gray-900/50">
            <h3 className="text-xl font-bold text-white mb-4">Hämta Företagsinformation</h3>
            <p className="text-sm text-gray-400 mb-5">Skriv in företagets organisationsnummer för att automatiskt hämta uppgifter. Detta säkerställer korrekt data och sparar tid. Guldstandard.</p>
            <form onSubmit={handleLookup} className="flex items-start space-x-3">
                <input
                    type="text"
                    value={orgnr}
                    onChange={(e) => setOrgnr(e.target.value)}
                    placeholder="Ange organisationsnummer..."
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow duration-200"
                />
                <button 
                    type="submit"
                    disabled={isLoading || !orgnr}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ring-offset-gray-900 transition-colors duration-200"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : <MagnifyingGlassIcon className="h-5 w-5"/>}
                </button>
            </form>

            {error && <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}

            {companyData && (
                <div className="mt-6">
                    <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-4">
                            <BuildingOffice2Icon className="h-8 w-8 text-gray-400 mr-4"/>
                            <h4 className="text-2xl font-bold text-white">{companyData.companyName}</h4>
                        </div>
                        <div className="space-y-3">
                            <div className={`flex items-center p-3 rounded-md ${companyData.hasFtax ? 'bg-green-800/40' : 'bg-red-800/40'}`}>
                                {companyData.hasFtax ? <CheckCircleIcon className='h-6 w-6 text-green-400 mr-3'/> : <ExclamationTriangleIcon className='h-6 w-6 text-red-400 mr-3'/>}
                                <p className={`font-semibold text-sm ${companyData.hasFtax ? 'text-green-300' : 'text-red-300'}`}>
                                    {companyData.hasFtax ? 'Godkänd för F-skatt' : 'Ej godkänd för F-skatt'}
                                </p>
                            </div>
                            <div className={`flex items-center p-3 rounded-md ${companyData.isVatRegistered ? 'bg-green-800/40' : 'bg-yellow-800/40'}`}>
                                {companyData.isVatRegistered ? <CheckCircleIcon className='h-6 w-6 text-green-400 mr-3'/> : <ExclamationTriangleIcon className='h-6 w-6 text-yellow-400 mr-3'/>}
                                <p className={`font-semibold text-sm ${companyData.isVatRegistered ? 'text-green-300' : 'text-yellow-300'}`}>
                                    {companyData.isVatRegistered ? 'Registrerad för moms' : 'Ej registrerad för moms'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <button 
                            onClick={() => onCompanySelect(companyData)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                        >
                            Använd detta företag
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
