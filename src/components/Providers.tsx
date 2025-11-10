
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

// BORTTAGET: All kontext-logik (Modal, UI, etc.) är bortkopplad och kommer att
// återinföras stegvis med en ny, enklare och mer robust arkitektur.
// import { ModalProvider } from '@/contexts/ModalContext';
// import { UIProvider } from '@/contexts/UIContext';
// import ModalRenderer from '@/components/modals/ModalRenderer';

interface Props {
    children: React.ReactNode;
}

/**
 * PROVIDER-TRÄD (Under ombyggnad)
 * Denna komponent hanterar globala providers. Just nu är endast SessionProvider
 * aktiv medan resten av applikationen byggs om.
 */
export default function Providers({ children }: Props) {
    return (
        <SessionProvider>
            {/* <UIProvider> */}
                {/* <ModalProvider> */}
                    {children}
                    {/* <ModalRenderer /> */}
                {/* </ModalProvider> */}
            {/* </UIProvider> */}
        </SessionProvider>
    );
}
