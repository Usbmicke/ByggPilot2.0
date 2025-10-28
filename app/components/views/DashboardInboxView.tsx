
'use client';

import React from 'react';
import { useEvents } from '@/app/hooks/useApi';
import { PROACTIVE_TIP_EVENT } from '@/app/constants/globalContent';
import ActionCard from '@/app/components/ActionCard';
import { Event, ActionableEvent } from '@/app/types/index';

/**
 * Konverterar en generisk Event till en ActionableEvent genom att berika den
 * med de fält som krävs för att den ska kunna presenteras i ett ActionCard.
 * Denna transformation är nu förenklad efter att datamodellen har harmoniserats.
 */
const transformEventToActionable = (event: Event): ActionableEvent => ({
    ...event,
    actionType: (event as any).actionType || 'UNKNOWN', // Behåll befintlig actionType om den finns, annars default
    suggestedNextStep: (event as any).suggestedNextStep || 'Granska händelsen',
});

const DashboardInboxView = () => {
    const { events: dynamicEvents, isLoading, isError } = useEvents();

    // Använder useMemo för att kombinera statiska och dynamiska händelser.
    const allActionableEvents = React.useMemo(() => {
        // Starta med det statiska, proaktiva tipset som redan är en ActionableEvent.
        const allEvents: ActionableEvent[] = [PROACTIVE_TIP_EVENT];

        // Transformera och lägg till de dynamiska händelserna från API:et.
        if (dynamicEvents) {
            const transformedDynamicEvents = dynamicEvents.map(transformEventToActionable);
            allEvents.push(...transformedDynamicEvents);
        }

        return allEvents;
    }, [dynamicEvents]);

    if (isLoading) {
        return <div className="text-center p-8 text-text-secondary">Laddar proaktiva förslag...</div>;
    }

    if (isError) {
        return <div className="text-center p-8 text-red-500">Kunde inte ladda förslag: {isError.message}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Proaktiva Förslag</h2>
            <p className="text-text-secondary mb-6">
                Här är vad ByggPilot har identifierat. Agera direkt på förslagen nedan.
            </p>
            {
                allActionableEvents.length > 0 ? (
                    allActionableEvents.map((event: ActionableEvent) => (
                        <ActionCard key={event.id} event={event} />
                    ))
                ) : (
                    <div className="text-center p-12 bg-background-secondary rounded-xl border border-dashed border-border-primary">
                        <h3 className="text-lg font-semibold text-text-primary">Inkorgen är tom!</h3>
                        <p className="text-text-secondary mt-1">ByggPilot har inte hittat några nya åtgärder att föreslå just nu.</p>
                    </div>
                )
            }
        </div>
    );
};

export default DashboardInboxView;
