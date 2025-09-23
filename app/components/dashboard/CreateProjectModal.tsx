'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/app/types';
import NewCustomerModal from '@/app/components/NewCustomerModal'; 
import { ChevronUpDownIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [projectName, setProjectName] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    const router = useRouter();

    // NYTT: Hämta det föreslagna projektnumret när modalen öppnas
    useEffect(() => {
        if (isOpen) {
            const fetchNextProjectNumber = async () => {
                try {
                    const response = await fetch('/api/projects/next-project-number');
                    if (!response.ok) throw new Error('Kunde inte hämta projektnummer');
                    const data = await response.json();
                    // Sätt projektnamnet med det nya numret, lämna plats för resten
                    setProjectName(`Projekt ${data.nextProjectNumber}: `);
                } catch (err) {
                    console.error("Fel vid hämtning av projektnummer:", err);
                    // Fallback om API:et fallerar
                    setProjectName('Nytt Projekt: ');
                }
            };

            const fetchCustomers = async () => {
                try {
                    const response = await fetch('/api/customers/list');
                    if (!response.ok) throw new Error('Kunde inte hämta kundlistan');
                    const data = await response.json();
                    setCustomers(data.customers || []);
                } catch (err) {
                    setError('Kunde inte ladda befintliga kunder.');
                }
            };
            
            fetchNextProjectNumber();
            fetchCustomers();
        }
    }, [isOpen]);

    const handleCustomerCreated = (newCustomer: Customer) => {
        setCustomers(prev => [newCustomer, ...prev]);
        setSelectedCustomer(newCustomer);
        setIsCustomerModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) {
            setError('Du måste välja en kund för projektet.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    projectName,
                    customerId: selectedCustomer.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Projektet kunde inte skapas');
            }

            const { projectId } = await response.json();
            handleClose();
            router.push(`/projects/${projectId}/calculations/new`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        // Återställer inte projectName här längre, då det ska sättas av useEffect
        setSelectedCustomer(null);
        setError(null);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={handleClose}>
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Starta Nytt Projekt & Offert</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                             <div>
                                <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">Projektnamn</label>
                                <input
                                    type="text"
                                    id="projectName"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-gray-900 border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder='Laddar projektnummer...'
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Kund</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                         <select
                                            id="customer-select"
                                            value={selectedCustomer?.id || ''}
                                            onChange={(e) => {
                                                const customer = customers.find(c => c.id === e.target.value);
                                                setSelectedCustomer(customer || null);
                                            }}
                                            className="w-full appearance-none bg-gray-900 border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-8"
                                            disabled={customers.length === 0}>
                                            <option value="" disabled>{customers.length > 0 ? 'Välj befintlig kund...' : 'Laddar kunder...'}</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <ChevronUpDownIcon className="pointer-events-none absolute top-3 right-2.5 w-5 h-5 text-gray-400"/>
                                    </div>
                                    <button type="button" onClick={() => setIsCustomerModalOpen(true)} className="flex-shrink-0 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors">
                                        <PlusCircleIcon className="w-5 h-5"/>
                                        <span>Ny</span>
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleClose} disabled={isLoading} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors">Avbryt</button>
                                <button type="submit" disabled={isLoading || !selectedCustomer} className="px-6 py-2 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 disabled:bg-gray-600/50 disabled:cursor-not-allowed transition-colors">
                                    {isLoading ? 'Skapar...' : 'Skapa & fortsätt'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <NewCustomerModal 
                isOpen={isCustomerModalOpen} 
                onClose={() => setIsCustomerModalOpen(false)} 
                onCustomerCreated={handleCustomerCreated}
            />
        </>
    );
}
