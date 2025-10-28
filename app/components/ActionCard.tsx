
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ActionableEvent } from '@/app/types/index'; 

// VÄRLDSKLASS-KORRIGERING: Formaterar nu ett Timestamp-objekt eller en ISO-sträng.
const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
};

// VÄRLDSKLASS-KORRIGERING: Ikoner mappas nu mot den korrekta 'type'-egenskapen och dess värden.
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
        default:
            return <span className="text-gray-400">?</span>;
    }
};

const ActionCard = ({ event }: { event: ActionableEvent }) => {
    const [isArchived, setIsArchived] = useState(event.isRead);

    const handleArchive = () => {
        // Här skulle man normalt anropa en API-endpoint för att markera som läst.
        console.log(`Markerar händelse ${event.id} som läst.`);
        setIsArchived(true);
    };

    if (isArchived) {
        return null;
    }

    return (
        <div className="bg-background-secondary border border-border-primary rounded-xl mb-4 overflow-hidden transition-all hover:border-cyan-500/50">
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-text-primary text-lg">
                        {/* VÄRLDSKLASS-KORRIGERING: Använder 'type' och 'title' från den korrekta datamodellen. */}
                        <ActionIcon type={event.type} /> {event.title}
                    </h3>
                    <span className="text-xs text-text-secondary">{formatDate(event.createdAt)}</span>
                </div>
                
                {/* VÄRLDSKLASS-KORRIGERING: Visar 'description' istället för de borttagna fälten. */}
                <p className="text-sm text-text-secondary mb-4">{event.description}</p>

                <div className="flex justify-end space-x-3">
                    {/* VÄRLDSKLASS-KORRIGERING: Funktionerna är nu anpassade till den nya datamodellen. */}
                    <button onClick={handleArchive} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Markera som läst</button>
                    <Link href={event.link} passHref>
                        <a className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">Visa</a>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
