'use client';

import React, { useState, useEffect } from 'react';
import ActionCard from '@/app/components/ActionCard';

const DashboardInboxView = () => {
    const [actions, setActions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const response = await fetch('/api/actions');
                if (!response.ok) {
                    throw new Error('Nätverksfel vid hämtning av åtgärder.');
                }
                const data = await response.json();
                setActions(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActions();
    }, []);

    if (isLoading) {
        return <div className="text-center p-8 text-gray-400">Laddar proaktiva förslag...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-400">Fel: {error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Proaktiva Förslag</h2>
            <p className="text-gray-400 mb-6">
                Här är vad ByggPilot har identifierat från dina anslutna integrationer. 
                Agera direkt eller ignorera för att rensa din inkorg.
            </p>
            {
                actions.length > 0 ? (
                    actions.map((action: any, index) => (
                        <ActionCard key={index} action={action} />
                    ))
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
