
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ModalProvider } from '@/app/contexts/ModalContext';
import { UIProvider } from '@/app/contexts/UIContext';
import { ChatProvider } from '@/app/contexts/ChatContext';

interface Props {
    children: React.ReactNode;
}

/**
 * GULDSTANDARD PROVIDER-TRÄD
 * Denna komponent konsoliderar ALLA globala providers till en enda, ren och
 * underhållsvänlig fil. Detta löser det ursprungliga problemet där ModalProvider
 * saknades, vilket orsakade en krasch på instrumentpanelen och en efterföljande
 * omdirigeringsloop. Genom att säkerställa att alla kontexter är tillgängliga
 * från roten av applikationen, garanterar vi en stabil och förutsägbar state-hantering.
 */
export default function Providers({ children }: Props) {
    return (
        <SessionProvider>
            <UIProvider>
                <ModalProvider>
                    <ChatProvider>
                        {children}
                    </ChatProvider>
                </ModalProvider>
            </UIProvider>
        </SessionProvider>
    );
}
