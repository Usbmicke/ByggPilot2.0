
'use client';

import React from 'react';
import { useEvents } from '@/app/hooks/useApi';
import { PROACTIVE_TIP_EVENT } from '@/app/constants/globalContent';
import ActionCard from '@/app/components/ActionCard';
import { Event, ActionableEvent } from '@/app/types/index';

/**
 * VÄRLDSKLASS-TRANSFORMATION: Konverterar alla typer av Events till en garanterat
 * renderbar ActionableEvent. Hanterar specialfall som 'log'-händelser som saknar
 * de UI-fält som ActionCard förväntar sig.
 */
const transformEventToActionable = (event: Event): ActionableEvent => {
    // Om eventet är av typen 'log', bygg upp ett komplett ActionableEvent.
    if (event.type === 'log') {
        const logEvent = event as { id: string; type: 'log'; message: string; [key: string]: any };
        return {
            id: logEvent.id,
            type: logEvent.type,
            title: 'Systemmeddelande',
            description: logEvent.message,
            link: '#', // Loggar har ingen specifik länk
            isRead: logEvent.isRead || false,
            createdAt: logEvent.createdAt || new Date(), // Använd befintlig eller skapa ny
            actionType: 'INFO',
            suggestedNextStep: 'Ingen åtgärd krävs.',
        };
    }

    // För alla andra händelsetyper, anta att de redan har den nödvändiga grundstrukturen.
    // Säkerställ att fälten `actionType` och `suggestedNextStep` alltid finns.
    const otherEvent = event as ActionableEvent;
    return {
        ...otherEvent,
        actionType: otherEvent.actionType || 'UNKNOWN',
        suggestedNextStep: otherEvent.suggestedNextStep || 'Granska händelsen',
    };
};

const DashboardInboxView = () => {
    const { events: dynamicEvents, isLoading, isError } = useEvents();

    const allActionableEvents = React.useMemo(() => {
        const allEvents: ActionableEvent[] = [PROACTIVE_TIP_EVENT];

        if (dynamicEvents) {
            const transformedDynamicEvents = dynamicEvents.map(transformEventToActionable);
            allEvents.push(...transformedDynamicEvents);
        }

        return allEvents;
    }, [dynamicEvents]);

    if (isLoading) {
        return <div className="text-center p-8 text-gray-400">Laddar proaktiva förslag...</div>;
    }

    if (isError) {
        // VÄRLDSKLASS-FÖRBÄTTRING: Ger ett mer informativt felmeddelande.
        return <div className="text-center p-8 text-red-400">Kunde inte ladda förslag: {isError.message}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Proaktiva Förslag</h2>
            <p className="text-gray-300 mb-6">
                Här är vad ByggPilot har identifierat. Agera direkt på förslagen nedan.
            </p>
            {
                allActionableEvents.length > 0 ? (
                    <div className="space-y-4">
                        {allActionableEvents.map((event: ActionableEvent) => (
                            <ActionCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                        <h3 className="text-lg font-semibold text-white">Inkorgen är tom!</h3>
                        <p className="text-gray-400 mt-1">ByggPilot har inte hittat några nya åtgärder att föreslå just nu.</p>
                    </div>
                )
            }
        </div>
    );
};

export default DashboardInboxView;
