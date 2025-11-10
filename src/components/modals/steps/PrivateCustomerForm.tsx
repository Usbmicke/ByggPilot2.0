
'use client';

import React, { useState } from 'react';
import { Customer } from '@/lib/schemas/customer'; // KORREKT IMPORT

interface PrivateCustomerFormProps {
    onSave: (data: Partial<Customer>) => void;
    isSaving: boolean;
}

export function PrivateCustomerForm({ onSave, isSaving }: PrivateCustomerFormProps) {
    // Byt ut firstName/lastName mot 'name' och härled vid behov
    const [formData, setFormData] = useState<Partial<Customer & { firstName?: string; lastName?: string }>>({ customerType: 'Private' });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { firstName, lastName, email, phone } = formData;

        if (!firstName || !lastName) {
            setError('Både för- och efternamn är obligatoriska.');
            return;
        }
        if (!email && !phone) {
            setError('Du måste ange antingen en e-postadress eller ett telefonnummer.');
            return;
        }
        setError(null);
        
        // Sätt samman namnet och ta bort temporära fält
        const finalData: Partial<Customer> = {
            ...formData,
            name: `${firstName} ${lastName}`,
        };
        delete (finalData as any).firstName;
        delete (finalData as any).lastName;

        onSave(finalData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Registrera Privatkund</h2>

            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">Kontaktuppgifter</h3>
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">Förnamn *</label>
                            <input type="text" name="firstName" id="firstName" value={formData.firstName || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" required />
                        </div>
                         <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Efternamn *</label>
                            <input type="text" name="lastName" id="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-post</label>
                            <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>
                     <p className="text-xs text-gray-500 pt-1">Du måste ange minst en kontaktväg.</p>
                </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">Adress (valfritt)</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Gatuadress</label>
                        <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-1">Postnummer</label>
                            <input type="text" name="zipCode" id="zipCode" value={formData.zipCode || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">Ort</label>
                            <input type="text" name="city" id="city" value={formData.city || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="my-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div className="mt-8 text-right">
                <button type="submit" disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-wait">
                    {isSaving ? 'Sparar...' : 'Spara Kund'}
                </button>
            </div>
        </form>
    );
}
