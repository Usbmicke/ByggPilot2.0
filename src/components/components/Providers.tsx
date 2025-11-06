
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ModalProvider } from '@/app/contexts/ModalContext';
import { UIProvider } from '@/app/contexts/UIContext';
// import { ChatProvider } from '@/contexts/ChatContext';
import ModalRenderer from '@/app/components/modals/ModalRenderer';

interface Props {
    children: React.ReactNode;
}

/**
 * GULDSTANDARD PROVIDER-TRÄD
 * Denna komponent konsoliderar ALLA globala providers till en enda, ren och
 * underhållsvänlig fil.
 */
export default function Providers({ children }: Props) {
    return (
        <SessionProvider>
            <UIProvider>
                <ModalProvider>
                    {/* <ChatProvider> */}
                        {children}
                    {/* </ChatProvider> */}
                    <ModalRenderer />
                </ModalProvider>
            </UIProvider>
        </SessionProvider>
    );
}
