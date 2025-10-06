'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, Project } from '@/app/types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface SendInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
    project: Project;
    onInvoiceSent: () => void; // Callback för att uppdatera UI
}

export default function SendInvoiceModal({ isOpen, onClose, invoice, project, onInvoiceSent }: SendInvoiceModalProps) {
    // TODO: Hämta kundens e-post från projekt/kund-data när det finns tillgängligt
    const [recipientEmail, setRecipientEmail] = useState('kundens.email@example.com');
    const [subject, setSubject] = useState(`Faktura från [Ditt Företagsnamn] för projekt: ${project.name}`);
    const [message, setMessage] = useState(
        `Hej ${invoice.customer.name},\n\Bifogat finner du faktura för arbetet med projektet \"${project.name}\".\n\nVänliga hälsningar,\n[Ditt Namn]`
    );
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Återställ state när modalen öppnas/stängs
        if (isOpen) {
             // TODO: Hämta kundens e-post från projekt/kund-data när det finns tillgängligt
            setRecipientEmail('kundens.email@example.com');
            setSubject(`Faktura från [Ditt Företagsnamn] för projekt: ${project.name}`);
            setMessage(`Hej ${invoice.customer.name},\n\Bifogat finner du faktura för arbetet med projektet \"${project.name}\".\n\nVänliga hälsningar,\n[Ditt Namn]`);
            setError(null);
        }
    }, [isOpen, invoice, project]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSending(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${project.id}/invoices/${invoice.id}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: recipientEmail, subject, message }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Något gick fel vid utskicket.');
            }

            onInvoiceSent(); // Anropa callback för att uppdatera UI:t i föräldern

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-5 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">Skicka Faktura</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div>
                            <label htmlFor="recipient" className="block text-sm font-medium text-gray-300">Mottagare</label>
                            <input type="email" id="recipient" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300">Ämne</label>
                            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Meddelande
                            </label>
                            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={8} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"></textarea>
                        </div>
                        {error && <p className="text-red-400 text-sm">{`Fel: ${error}`}</p>}
                    </div>

                    <div className="p-5 border-t border-gray-700 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg">Avbryt</button>
                        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-500" disabled={isSending}>
                            {isSending ? 'Skickar...' : 'Skicka Faktura'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
