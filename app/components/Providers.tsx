
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

interface Props {
    children: React.ReactNode;
}

// Denna komponent omsluter nu applikationen med ENDAST den provider som behövs för NextAuth.
export default function Providers({ children }: Props) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}
