
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ModalProvider } from '@/app/contexts/ModalContext';
import { UIProvider } from '@/app/contexts/UIContext';
import { ChatProvider } from '@/app/contexts/ChatContext';
import ModalRenderer from '../components/modals/ModalRenderer'; // Importerad!

interface Props {
    children: React.ReactNode;
}

/**
 * GULDSTANDARD PROVIDER-TRÄD
 * Denna komponent konsoliderar ALLA globala providers till en enda, ren och
 * underhållsvänlig fil. Genom att inkludera ModalRenderer här säkerställer vi
 * att modaler kan visas globalt över hela applikationen.
 */
export default function Providers({ children }: Props) {
    return (
        <SessionProvider>
            <UIProvider>
                <ModalProvider>
                    <ChatProvider>
                        {children}
                    </ChatProvider>
                    {/* ModalRenderer placeras här för att rendera ovanpå allt annat */}
                    <ModalRenderer />
                </ModalProvider>
            </UIProvider>
        </SessionProvider>
    );
}
