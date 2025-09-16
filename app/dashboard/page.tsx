'use client';

import { useSession } from 'next-auth/react';
import DashboardView from '@/app/components/views/DashboardView';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Om AuthGuard i layout.tsx fungerar, borde detta aldrig hända,
    // men det är en extra säkerhetsåtgärd.
    if (status === 'unauthenticated') {
        router.push('/');
        return null;
    }

    // Visa en laddningsskärm medan sessionen hämtas.
    // AuthContext laddar först, sedan laddar NextAuth sessionen. Detta är normalt.
    if (status === 'loading' || !session?.user) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-white">Laddar instrumentpanel...</p>
            </div>
        );
    }

    // När sessionen är laddad, rendera den faktiska instrumentpanelen.
    return (
        <DashboardView
            projects={[]}
            customers={[]}
            username={session.user.name || 'Användare'}
            isDemo={false}
        />
    );
}
