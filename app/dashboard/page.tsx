'use client';

import { useSession } from 'next-auth/react';
import DashboardView from '@/app/components/views/DashboardView';

export default function DashboardPage() {
    const { data: session } = useSession();

    if (session) {
        // Riktig data för inloggad användare
        // Du kan hämta och skicka riktig data till DashboardView här
        return <DashboardView projects={[]} customers={[]} username={session.user?.name || 'Användare'} isDemo={false} />;
    } else {
        // Fallback eller demoläge om sessionen inte finns
        // Använd mockData här om du vill
        return <DashboardView projects={[]} customers={[]} username="Demoläge" isDemo={true} />;
    }
}
