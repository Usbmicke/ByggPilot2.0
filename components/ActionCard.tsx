
'use client';

import React, { useState } from 'react';
import { ActionableEvent } from '@/app/types'; // Importera den nya, starka typen

// En hjälpfunktion för att formatera datum
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
};

// Ikoner för olika åtgärdstyper. Använder nu den starkt typade actionType.
const ActionIcon = ({ type }: { type: ActionableEvent['actionType'] }) => {
    switch (type) {
        case 'PROJECT_LEAD':
            return <span className="text-cyan-400">★</span>; // Stjärna för ny lead
        case 'INVOICE_PROCESSING':
            return <span className="text-amber-400">§</span>; // Paragraf för faktura
        default:
            return <span className="text-gray-400">?</span>;
    }
};

// Komponenten accepterar nu en starkt typad `event`-prop.
const ActionCard = ({ event }: { event: ActionableEvent }) => {
    const [isArchived, setIsArchived] = useState(false);

    const handleApprove = () => {
        alert(`Godkänn-logik för ${event.actionType} ej implementerad.`);
        setIsArchived(true);
    };

    const handleModify = () => {
        alert(`Ändra-logik för ${event.actionType} ej implementerad.`);
    };

    const handleIgnore = () => {
        setIsArchived(true);
    };

    if (isArchived) {
        return null;
    }

    return (
        <div className="bg-background-secondary border border-border-primary rounded-xl mb-4 overflow-hidden transition-all hover:border-cyan-500/50">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-text-primary text-lg mb-2">
                        {/* Notera: Bytet från action.summary till event.title görs här */}
                        <ActionIcon type={event.actionType} /> {event.title} 
                    </h3>
                    {event.actionType === 'INVOICE_PROCESSING' && (
                        <div className="text-right">
                            <p className="text-xl font-semibold text-text-primary">{event.amount?.toLocaleString('sv-SE')} {event.currency}</p>
                            <p className="text-sm text-red-400">Förfaller: {formatDate(event.dueDate)}</p>
                        </div>
                    )}
                </div>
                
                 {/* Bytet från action.details till event.description görs här */}
                <p className="text-text-secondary mb-4">{event.description}</p>

                <div className="bg-background-tertiary p-3 rounded-md mb-5">
                     <p className="text-sm text-text-secondary">Kontakt: <span className="font-medium text-text-primary">{event.contact?.name || 'N/A'}</span> ({event.contact?.email || 'N/A'})</p>
                    <p className="text-sm text-cyan-300 mt-1">Förslag: <span className="font-medium text-cyan-200">{event.suggestedNextStep}</span></p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button onClick={handleIgnore} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Ignorera</button>
                    <button onClick={handleModify} className="bg-background-secondary-alt hover:bg-gray-600 text-text-primary font-semibold py-2 px-4 rounded-lg transition-colors">Ändra</button>
                    <button onClick={handleApprove} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Godkänn & Agera</button>
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
