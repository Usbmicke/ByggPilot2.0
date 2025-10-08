
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUI } from '@/contexts/UIContext';
import { getSuggestedActions, updateActionStatus } from '@/actions/suggestionActions';
import { SparklesIcon } from '@heroicons/react/24/outline';

// Typdefinitionen är nu mer specifik baserat på den faktiska datan
interface SuggestedAction {
    id: string;
    summary: string;
    suggestedNextStep: string;
    actionType: 'CREATE_PROSPECT' | 'CREATE_CUSTOMER';
    extractedData: {
        customerName?: string;
        projectName?: string;
    };
    sourceEmail: { 
        from: string;
        subject: string;
    };
}

export function ActionSuggestions() {
    const { data: session } = useSession();
    const { openModal } = useUI(); // Använd UI-kontexten för att öppna modaler
    const [actions, setActions] = useState<SuggestedAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActions = async () => {
        if (!session?.user?.id) return;
        setIsLoading(true);
        try {
            const result = await getSuggestedActions(session.user.id);
            if (result.success && result.data) {
                setActions(result.data as SuggestedAction[]);
            } else {
                throw new Error(result.error || 'Nätverksfel vid hämtning av åtgärder.');
            }
        } catch (err: any) {
            setError(err.message || 'Ett okänt fel inträffade.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActions();
    }, [session]);

    const handleIgnore = async (actionId: string) => {
        if (!session?.user?.id) return;
        
        // Ta bort direkt från UI för snabb respons
        const originalActions = actions;
        setActions(prev => prev.filter(a => a.id !== actionId));

        const result = await updateActionStatus(session.user.id, actionId, 'ignored');
        if (!result.success) {
            console.error("Kunde inte ignorera åtgärd:", result.error);
            // Återställ UI om anropet misslyckas
            setActions(originalActions);
            alert(`Kunde inte ignorera åtgärden: ${result.error}`);
        }
    };
    
    const handleManage = (action: SuggestedAction) => {
        // Detta är den intelligenta logiken från ai_context.md
        switch (action.actionType) {
            case 'CREATE_PROSPECT':
                openModal('createOffer', { 
                    projectName: action.extractedData.projectName, 
                    customerName: action.extractedData.customerName 
                });
                break;
            case 'CREATE_CUSTOMER':
                openModal('createCustomer', { 
                    customerName: action.extractedData.customerName 
                });
                break;
            default:
                alert('Okänd åtgärdstyp. Kan inte hantera.');
                break;
        }
        // Markera som hanterad i bakgrunden
        if (session?.user?.id) {
            updateActionStatus(session.user.id, action.id, 'done');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-600 rounded w-3/4"></div>
            </div>
        );
    }

    if (error) {
        return <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-lg">Fel: {error}</div>;
    }

    if (actions.length === 0) {
        return (
             <div className="text-center bg-gray-800/50 border-2 border-dashed border-gray-700 p-12 rounded-lg">
                <SparklesIcon className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-300">Inkorgen är tom!</h3>
                <p className="mt-1 text-sm text-gray-500">Bra jobbat! Inga nya föreslagna åtgärder från din e-post just nu.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {actions.map((action) => (
                <div key={action.id} className="bg-gray-800/70 p-4 rounded-lg shadow-md border border-gray-700 hover:border-cyan-500 transition-colors">
                    <div className="flex justify-between items-start">
                         <div>
                             <p className="text-sm font-semibold text-cyan-400">{action.actionType === 'CREATE_PROSPECT' ? 'Ny Projektförfrågan' : 'Ny Kund'}</p>
                             <p className="text-lg font-bold text-white">{action.summary}</p>
                             <p className="text-sm text-gray-400 mt-1">{action.suggestedNextStep}</p>
                             <p className="text-xs text-gray-500 mt-3">Källa: E-post från {action.sourceEmail.from}</p>
                         </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 ml-4 flex-shrink-0">
                            <button onClick={() => handleManage(action)} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-sm transition-colors">Hantera</button>
                            <button onClick={() => handleIgnore(action.id)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/80 rounded-lg hover:bg-gray-700">Ignorera</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
