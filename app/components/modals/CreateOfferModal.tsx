
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Customer } from '@/types/customer';
import CalculationEngine from '@/components/dashboard/CalculationEngine';
import { useSession } from 'next-auth/react';

interface CreateOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({ isOpen, onClose }) => {
    const { data: session } = useSession();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState('select_customer'); // 'select_customer' | 'calculation'
    const [newOfferProjectId, setNewOfferProjectId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && step === 'select_customer') {
            // Reset state when modal is reopened
            resetState();
            const fetchCustomers = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch('/api/customers/list');
                    if (!response.ok) throw new Error('Kunde inte hämta kunder.');
                    const data = await response.json();
                    setCustomers(data.customers || []);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCustomers();
        }
    }, [isOpen, step]);

    const resetState = () => {
        setSelectedCustomerId('');
        setNewOfferProjectId(null);
        setError(null);
        setStep('select_customer');
    };

    const handleContinue = async () => {
        if (!selectedCustomerId) {
            setError('Du måste välja en kund.');
            return;
        }
        if (!session?.user?.id) {
            setError('Kunde inte verifiera användare. Logga in igen.');
            return;
        }

        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
        if (!selectedCustomer) {
             setError('Den valda kunden hittades inte.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/projects/create-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer: selectedCustomer, userId: session.user.id }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.details || 'Kunde inte skapa offert-projektet.');
            }

            const { projectId } = await response.json();
            setNewOfferProjectId(projectId);
            setStep('calculation');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod vid skapande av offert.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
      resetState();
      onClose();
    }

    const renderContent = () => {
        switch (step) {
            case 'select_customer':
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Välj kund för offerten</h3>
                        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
                        <select 
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full bg-gray-700 text-white p-2 rounded-md mb-4 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="" disabled>Välj en befintlig kund...</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        
                        {/* TODO: Implement New Customer Form */}
                        <p className="text-center text-sm text-gray-400 my-4">...eller</p>
                        <button 
                            onClick={() => alert('Funktion för att skapa ny kund är under utveckling.')}
                            className="w-full text-center py-2 px-4 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            Skapa Ny Kund
                        </button>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                             <button 
                                onClick={handleContinue}
                                disabled={isLoading || !selectedCustomerId}
                                className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-cyan-700"
                            >
                                {isLoading ? 'Skapar...' : 'Fortsätt till kalkyl'}
                            </button>
                        </div>
                    </div>
                );

            case 'calculation':
                return newOfferProjectId ? (
                    <div className="p-2 sm:p-4 md:p-6">
                      <CalculationEngine projectId={newOfferProjectId} />
                    </div>
                ) : null;
            
            default:
                return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={step === 'select_customer' ? 'Skapa ny offert' : 'Kalkylunderlag'} wide={step === 'calculation'}>
           {renderContent()}
        </Modal>
    );
};

export default CreateOfferModal;
