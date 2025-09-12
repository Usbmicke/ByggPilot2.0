
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, ProjectStatus } from '@/app/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const NewProjectPage = () => {
    const router = useRouter();
    const [projectName, setProjectName] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [status, setStatus] = useState<ProjectStatus>('Planerat');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hämta kunder för dropdown
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('/api/customers/list');
                if (!response.ok) {
                    throw new Error('Kunde inte hämta kunder.');
                }
                const data: Customer[] = await response.json();
                setCustomers(data);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName || !selectedCustomer) {
            setError('Projektnamn och kund måste fyllas i.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const [customerId, customerName] = selectedCustomer.split('||');

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: projectName, customerId, customerName, status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Något gick fel.');
            }

            const newProject = await response.json();
            
            // Omdirigera till den nya projektsidan
            router.push(`/projects/${newProject.id}`);

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
             <Link href="/projects" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Avbryt
            </Link>
            <h1 className="text-3xl font-bold text-white mb-6">Skapa nytt projekt</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 border border-gray-700 rounded-lg p-8">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">Projektnamn</label>
                    <input
                        type="text"
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-gray-900 border-gray-700 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder='Ex: Altanbygge hos Nilsson'
                        required
                    />
                </div>

                <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-300 mb-2">Kund</label>
                    <select
                        id="customer"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="w-full bg-gray-900 border-gray-700 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                    >
                        <option value="" disabled>Välj en kund...</option>
                        {customers.map(c => (
                            <option key={c.id} value={`${c.id}||${c.name}`}>{c.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Saknas kunden? <Link href="/customers/new" className="text-cyan-400 hover:underline">Skapa ny kund här.</Link></p>
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                        className="w-full bg-gray-900 border-gray-700 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="Planerat">Planerat</option>
                        <option value="Pågående">Pågående</option>
                        <option value="Avslutat">Avslutat</option>
                    </select>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Skapar...' : 'Skapa projekt'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProjectPage;
