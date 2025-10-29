
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ActionableEvent } from '@/app/types/index';

const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ActionIcon = ({ type }: { type: ActionableEvent['type'] }) => {
    switch (type) {
        case 'new_task':
            return <span className="text-cyan-400">✓</span>;
        case 'invoice_due':
            return <span className="text-amber-400">!</span>;
        case 'project_approved':
            return <span className="text-green-400">★</span>;
        case 'new_message':
            return <span className="text-blue-400">✉</span>;
        case 'log': // Ikon för logg-händelser
            return <span className="text-gray-400">ℹ</span>;
        case 'Tip': // Ikon för proaktiva tips
            return <span className="text-purple-400">💡</span>;
        default:
            return <span className="text-gray-400">?</span>;
    }
};

const ActionCard = ({ event }: { event: ActionableEvent }) => {
    const [isArchived, setIsArchived] = useState(event.isRead);

    const handleArchive = () => {
        console.log(`Markerar händelse ${event.id} som läst.`);
        setIsArchived(true);
    };

    if (isArchived) {
        return null;
    }

    // VÄRLDSKLASS-ARKITEKTUR: Renderar en länk endast om event.link existerar.
    // Annars renderas en statisk div. Detta säkerställer typsäkerhet och korrekt UI.
    const cardContent = (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl mb-4 overflow-hidden transition-all duration-300 ease-in-out hover:border-cyan-500/50 hover:shadow-lg">
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-lg flex items-center gap-3">
                        <ActionIcon type={event.type} />
                        <span>{event.title || 'Systemmeddelande'}</span>
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 pt-1">{formatDate(event.createdAt)}</span>
                </div>
                
                <p className="text-sm text-gray-300 mb-4 ml-7">{event.description || event.message}</p>

                <div className="flex justify-end space-x-3 items-center">
                    <button onClick={handleArchive} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Markera som läst</button>
                    {/* Visa knappen endast om det finns en länk att följa */}
                    {event.link && event.link !== '#' && (
                         <Link href={event.link} passHref>
                            <span className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm cursor-pointer">Visa</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
    
    return cardContent;
};

export default ActionCard;
