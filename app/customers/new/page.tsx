
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const NewCustomerPage = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isCompany, setIsCompany] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            setError('Kundnamn måste fyllas i.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/customers/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, isCompany }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Något gick fel.');
            }

            // Gå tillbaka till föregående sida (t.ex. Nytt Projekt-formuläret)
            router.back();

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                Avbryt och gå tillbaka
            </button>

            <h1 className="text-3xl font-bold text-white mb-6">Skapa ny kund</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 border border-gray-700 rounded-lg p-8">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Namn</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-900 border-gray-700 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder='Företag AB eller Kalle Svensson'
                        required
                    />
                </div>

                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">E-post (valfritt)</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-900 border-gray-700 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder='kontakt@foretag.se'
                    />
                </div>

                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Telefon (valfritt)</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-900 border-gray-700 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder='070-123 45 67'
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="isCompany"
                        type="checkbox"
                        checked={isCompany}
                        onChange={(e) => setIsCompany(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-cyan-600 focus:ring-cyan-500"
                    />
                    <label htmlFor="isCompany" className="ml-3 block text-sm text-gray-300">
                        Är detta ett företag?
                    </label>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sparar...' : 'Spara kund'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewCustomerPage;
