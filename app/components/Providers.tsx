
'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/app/context/AuthContext';

interface Props {
    children: React.ReactNode;
}

// Denna komponent omsluter applikationen med alla nödvändiga providers.
export default function Providers({ children }: Props) {
    return (
        <SessionProvider>
            <AuthProvider> 
                {children}
            </AuthProvider>
        </SessionProvider>
    );
}
