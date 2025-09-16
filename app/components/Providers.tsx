'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface Props {
    children: React.ReactNode;
}

// Detta är en klientkomponent som tillhandahåller NextAuth-sessionen 
// till alla sina barnkomponenter.
export default function Providers({ children }: Props) {
    return <SessionProvider>{children}</SessionProvider>;
}
