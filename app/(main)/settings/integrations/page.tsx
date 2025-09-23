
import React from 'react';
import GoogleConnectButton from '@/app/components/GoogleConnectButton';

// Dummy-data för att representera användarens integrationsstatus
// I en riktig applikation skulle detta hämtas från databasen.
const getUserIntegrations = async () => {
    // TODO: Hämta från databasen om användaren har en aktiv Google/Outlook-integration
    return {
        hasGoogleIntegration: false, // Simulerad data
    };
}

export default async function IntegrationsPage() {

    const integrations = await getUserIntegrations();

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Integrationer</h1>
            <p className="text-gray-400 mb-8">Koppla ByggPilot till dina andra verktyg för att automatisera ditt arbetsflöde.</p>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white">E-post & Kalender</h2>
                    <p className="text-gray-400 mt-1">Låt ByggPilot agera som din proaktiva assistent genom att läsa av din inkorg och hantera din kalender.</p>

                    <div className="mt-6 bg-gray-900/50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Google (Gmail & Kalender)</p>
                            <p className={`text-sm ${integrations.hasGoogleIntegration ? 'text-green-400' : 'text-gray-500'}`}>
                                {integrations.hasGoogleIntegration ? 'Ansluten' : 'Ej ansluten'}
                            </p>
                        </div>
                        <GoogleConnectButton isConnected={integrations.hasGoogleIntegration} />
                    </div>
                    {/* Här kan vi lägga till knappar för Outlook etc. i framtiden */}
                </div>
            </div>
        </div>
    );
}
