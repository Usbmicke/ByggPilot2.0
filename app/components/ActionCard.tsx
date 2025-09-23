'use client';

import React, { useState } from 'react';

// En hjälpfunktion för att formatera datum
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
};

// Ikoner för olika åtgärdstyper
const ActionIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'PROJECT_LEAD':
            return <span className="text-cyan-400">★</span>; // Stjärna för ny lead
        case 'INVOICE_PROCESSING':
            return <span className="text-amber-400">§</span>; // Paragraf för faktura
        default:
            return <span className="text-gray-400">?</span>;
    }
};

const ActionCard = ({ action }: { action: any }) => {
    const [isArchived, setIsArchived] = useState(false);

    // Funktioner för att hantera knapptryckningar (just nu bara UI-ändringar)
    const handleApprove = () => {
        // TODO: Implementera den faktiska logiken. 
        // Exempel: För en PROJECT_LEAD, skapa ett nytt projekt.
        // För en INVOICE_PROCESSING, skicka till attestering.
        alert(`Godkänn-logik för ${action.actionType} ej implementerad.`);
        setIsArchived(true); // Göm kortet när åtgärd är vidtagen
    };

    const handleModify = () => {
        // TODO: Öppna en modal eller vy för att redigera informationen.
        alert(`Ändra-logik för ${action.actionType} ej implementerad.`);
    };

    const handleIgnore = () => {
        // TODO: Anropa ett API för att markera denna åtgärd som 'ignorerad' i databasen.
        setIsArchived(true);
    };

    if (isArchived) {
        return null; // Göm kortet om det är arkiverat
    }

    return (
        <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl mb-4 overflow-hidden transition-all hover:border-cyan-500/50">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-lg mb-2">
                        <ActionIcon type={action.actionType} /> {action.summary}
                    </h3>
                    {action.actionType === 'INVOICE_PROCESSING' && (
                        <div className="text-right">
                            <p className="text-xl font-semibold text-white">{action.amount.toLocaleString('sv-SE')} {action.currency}</p>
                            <p className="text-sm text-red-400">Förfaller: {formatDate(action.dueDate)}</p>
                        </div>
                    )}
                </div>
                
                <p className="text-gray-300 mb-4">{action.details}</p>

                <div className="bg-gray-900/50 p-3 rounded-md mb-5">
                     <p className="text-sm text-gray-400">Kontakt: <span className="font-medium text-gray-200">{action.contact?.name || 'N/A'}</span> ({action.contact?.email || 'N/A'})</p>
                    <p className="text-sm text-cyan-300 mt-1">Förslag: <span className="font-medium text-cyan-200">{action.suggestedNextStep}</span></p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button onClick={handleIgnore} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Ignorera</button>
                    <button onClick={handleModify} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Ändra</button>
                    <button onClick={handleApprove} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Godkänn & Agera</button>
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
