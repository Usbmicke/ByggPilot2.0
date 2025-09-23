'use client';

import React, { useState } from 'react';
import { XMarkIcon, MicrophoneIcon, CameraIcon } from '@heroicons/react/24/outline';

interface CreateAtaModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    // Funktion för att uppdatera listan i AtaView direkt
    onAtaCreated: (newAta: any) => void; 
}

export default function CreateAtaModal({ isOpen, onClose, projectId, onAtaCreated }: CreateAtaModalProps) {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        setError(null);
        
        if (!title && !notes) {
            setError('Du måste ange en titel eller en anteckning.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/atas/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    projectId,
                    title, 
                    notes 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'ÄTA-utkastet kunde inte sparas');
            }
            
            const newAta = await response.json();
            
            // Anropa callback för att uppdatera UI:t i realtid
            onAtaCreated(newAta);
            handleClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        setTitle('');
        setNotes('');
        setIsRecording(false);
        setError(null);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={handleClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Nytt ÄTA-underlag</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700/50">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label htmlFor="ata-title" className="block text-sm font-medium text-gray-300 mb-1">Kort beskrivning (valfritt)</label>
                        <input
                            type="text"
                            id="ata-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-900 border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder='Ex: Extra eluttag i kök'
                        />
                    </div>
                    
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">Fånga på plats</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => alert('Funktion för röstmemo kommer snart!')}
                                className={`flex flex-col items-center justify-center p-6 rounded-lg transition-colors border-2 border-dashed border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50`}
                            >
                                <MicrophoneIcon className={`w-10 h-10 text-gray-400`} />
                                <span className={`mt-2 text-sm font-semibold text-gray-300`}>
                                    Spela in röstmemo
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => alert('Funktion för bilduppladdning kommer snart!')}
                                className="flex flex-col items-center justify-center p-6 rounded-lg transition-colors border-2 border-dashed border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50"
                            >
                                <CameraIcon className="w-10 h-10 text-gray-400" />
                                <span className="mt-2 text-sm font-semibold text-gray-300">Ta/välj bild</span>
                            </button>
                        </div>
                    </div>
                    
                     <div>
                        <label htmlFor="ata-notes" className="block text-sm font-medium text-gray-300 mb-1">Anteckningar</label>
                         <textarea
                            id="ata-notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-gray-900 border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder='Skriv ner detaljer, material, överenskommelser...'
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>

                <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                    <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors">Avbryt</button>
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 disabled:bg-gray-600/50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Sparar utkast...' : 'Spara utkast'}
                    </button>
                </div>
            </div>
        </div>
    );
}
