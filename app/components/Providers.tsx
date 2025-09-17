
'use client';

import React from 'react';
import { AuthProvider } from '@/app/context/AuthContext'; // Importera vår nya AuthProvider

interface Props {
    children: React.ReactNode;
}

// Denna komponent omsluter nu ENDAST med AuthProvider, vilket är korrekt.
export default function Providers({ children }: Props) {
    return (
        <AuthProvider> 
            {children}
        </AuthProvider>
    );
}
