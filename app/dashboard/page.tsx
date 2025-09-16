'use client';

import { useSession } from 'next-auth/react';
import DashboardView from '@/app/components/views/DashboardView';

// Denna sida visar nu ALLTID dashboard-vyn.
// AuthGuard har flyttats till layout-nivån (app/dashboard/layout.tsx) 
// för att skydda hela dashboarden, vilket är en bättre arkitektur.

export default function DashboardPage() {
    const { data: session } = useSession();

    // Eftersom sidan skyddas av AuthGuard i layouten, kan vi anta att
    // sessionen kommer att finnas här. Vi skickar användarnamnet vidare.
    return (
        <div className="h-full w-full">
            <DashboardView username={session?.user?.name || 'Användare'} />
        </div>
    );
}
