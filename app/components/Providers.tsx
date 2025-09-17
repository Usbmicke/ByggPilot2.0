
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { AuthProvider } from '@/app/context/AuthContext'; // Importera vår nya AuthProvider

interface Props {
    children: React.ReactNode;
}

export default function Providers({ children }: Props) {
    return (
        <AuthProvider> 
            <SessionProvider>
                {children}
            </SessionProvider>
        </AuthProvider>
    );
}
