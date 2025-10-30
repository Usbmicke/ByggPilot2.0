'use client';

import React, { useState } from 'react';

interface GoogleConnectButtonProps {
    isConnected: boolean;
}

export default function GoogleConnectButton({ isConnected }: GoogleConnectButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = () => {
        setIsLoading(true);
        // Omdirigera användaren för att starta anslutningsflödet.
        window.location.href = '/api/auth/integrations/google/connect';
    };

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/integrations/google/disconnect', {
                method: 'POST',
            });

            if (response.ok) {
                // Ladda om sidan för att reflektera det nya tillståndet.
                window.location.reload();
            } else {
                console.error('Kunde inte koppla från Google-kontot.', await response.json());
                alert('Något gick fel. Försök igen.');
            }
        } catch (error) {
            console.error('Ett fel inträffade vid frånkoppling:', error);
            alert('Ett nätverksfel inträffade. Kontrollera din anslutning.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isConnected) {
        return (
            <button 
                onClick={handleDisconnect}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Kopplar från...' : 'Koppla från'}
            </button>
        );
    }

    return (
        <button 
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Ansluter...' : 'Anslut'}
        </button>
    );
}
