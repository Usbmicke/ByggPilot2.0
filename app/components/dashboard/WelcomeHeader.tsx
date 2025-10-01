
'use client';

import { useSession } from 'next-auth/react';
import DashboardSummary from './DashboardSummary'; // Importera summary-komponenten

export function WelcomeHeader() {
    const { data: session } = useSession();
    const userName = session?.user?.name?.split(' ')[0] || 'Byggare';

    return (
        // En container som håller både välkomstmeddelandet och KPI-korten
        <div className="bg-background-secondary p-6 rounded-lg border border-border-primary shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
                        Välkommen tillbaka, {userName}!
                    </h1>
                    <p className="mt-1 text-md text-text-secondary">Här är en snabb överblick av ditt företag.</p>
                </div>
                {/* Dölj den här knappen på små skärmar där menyn används istället */}
                <div className="hidden lg:block">
                     {/* Framtida plats för en global "Skapa Nytt"-knapp */}
                </div>
            </div>

            {/* Divider och KPI-kort */}
            <div className="mt-6 border-t border-border-primary pt-6">
                <DashboardSummary />
            </div>
        </div>
    );
}
