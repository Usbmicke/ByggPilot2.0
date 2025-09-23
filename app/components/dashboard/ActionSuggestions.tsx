'use client';

import { useEffect, useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline'; // Importerar en passande ikon

// Typdefinition för en enskild åtgärd
interface Action {
    id: string;
    summary: string;
    suggestedNextStep: string;
    actionType: 'PROJECT_LEAD' | 'INVOICE_PROCESSING';
    sourceEmail: { 
        from: string;
        subject: string;
    };
}

export function ActionSuggestions() {
    const [actions, setActions] = useState<Action[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/actions');
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Nätverksfel vid hämtning av åtgärder.' }));
                throw new Error(errorBody.message);
            }
            const data: Action[] = await response.json();
            setActions(data);
        } catch (err: any) {
            setError(err.message || 'Ett okänt fel inträffade.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActions();
    }, []);

    // Hanterar ignorerade åtgärder
    const handleIgnore = async (actionId: string) => {
        setActions(prev => prev.filter(a => a.id !== actionId));
        try {
            await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actionId, newStatus: 'ignored' }),
            });
        } catch (err) {
            console.error("Kunde inte ignorera åtgärd:", err);
            // TODO: Återställ UI vid misslyckande?
        }
    };

    // Laddnings-skelett för en mer behaglig upplevelse
    if (isLoading) {
        return (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-600 rounded w-3/4"></div>
            </div>
        );
    }

    // Förbättrad felhantering
    if (error) {
        return <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-lg">Fel: {error}</div>;
    }

    // Ny, stilren design för tomt tillstånd
    if (actions.length === 0) {
        return (
             <div className="text-center bg-gray-800/50 border-2 border-dashed border-gray-700 p-12 rounded-lg">
                <SparklesIcon className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-300">Inkorgen är tom!</h3>
                <p className="mt-1 text-sm text-gray-500">Bra jobbat! Det finns inga nya föreslagna åtgärder just nu.</p>
            </div>
        );
    }

    // Design för listan med åtgärder
    return (
        <div className="space-y-4">
            {actions.map((action) => (
                <div key={action.id} className="bg-gray-800/70 p-4 rounded-lg shadow-md border border-gray-700 hover:border-indigo-500 transition-colors">
                    <div className="flex justify-between items-start">
                         <div>
                             <p className="text-sm font-semibold text-indigo-400">{action.actionType === 'PROJECT_LEAD' ? 'Ny kundförfrågan' : 'Faktura att behandla'}</p>
                             <p className="text-lg font-bold text-white">{action.summary}</p>
                             <p className="text-sm text-gray-400 mt-1">{action.suggestedNextStep}</p>
                             <p className="text-xs text-gray-500 mt-3">Från: {action.sourceEmail.from} - Ämne: {action.sourceEmail.subject}</p>
                         </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 ml-4 flex-shrink-0">
                            <button className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">Hantera</button>
                            <button onClick={() => handleIgnore(action.id)} className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Ignorera</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
