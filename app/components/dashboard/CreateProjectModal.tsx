'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
    onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
    const [projectName, setProjectName] = useState('');
    const [clientName, setClientName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName, clientName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Något gick fel');
            }

            const { projectId } = await response.json();
            onClose();
            router.push(`/dashboard/projects/${projectId}`);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Skapa Nytt Projekt</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">Projektnamn</label>
                        <input
                            type="text"
                            id="projectName"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder='Ex: Badrumsrenovering hos Nilsson'
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="clientName" className="block text-sm font-medium text-gray-300 mb-1">Kundens namn</label>
                        <input
                            type="text"
                            id="clientName"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder='Ex: Kalle Anka'
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors">Avbryt</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 disabled:bg-gray-600 transition-colors">
                            {isLoading ? 'Skapar...' : 'Skapa Projekt'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
