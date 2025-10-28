
'use client';

import React, { useState } from 'react';

interface PrivateCustomerData {
    fullName: string;
    email?: string;
    phone?: string;
    address?: {
        street?: string;
        zipCode?: string;
        city?: string;
    };
}

interface PrivateCustomerFormProps {
    onSave: (data: PrivateCustomerData) => void;
    isSaving: boolean;
}

export function PrivateCustomerForm({ onSave, isSaving }: PrivateCustomerFormProps) {
    const [formData, setFormData] = useState<PrivateCustomerData>({ fullName: '' });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...(prev[parent as keyof typeof prev] || {}), [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName) {
            setError('Fullständigt namn är obligatoriskt.');
            return;
        }
        if (!formData.email && !formData.phone) {
            setError('Du måste ange antingen en e-postadress eller ett telefonnummer.');
            return;
        }
        setError(null);
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Registrera Privatkund</h2>

            {/* Grundläggande Information */}
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">Kontaktuppgifter</h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Fullständigt namn *</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" required />
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
                     <p className="text-xs text-gray-500 pt-1">Du måste ange minst en av ovanstående.</p>
                </div>
            </div>

            {/* Adressinformation (valfritt) */}
            <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">Adress (valfritt)</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="address.street" className="block text-sm font-medium text-gray-300 mb-1">Gatuadress</label>
                        <input type="text" name="address.street" id="address.street" value={formData.address?.street || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-300 mb-1">Postnummer</label>
                            <input type="text" name="address.zipCode" id="address.zipCode" value={formData.address?.zipCode || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label htmlFor="address.city" className="block text-sm font-medium text-gray-300 mb-1">Ort</label>
                            <input type="text" name="address.city" id="address.city" value={formData.address?.city || ''} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500" />
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
