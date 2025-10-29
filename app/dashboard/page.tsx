
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next'; 
import { authOptions } from '@/lib/config/authOptions'; 
import { FolderIcon, InboxIcon, SparklesIcon } from '@heroicons/react/24/outline';
// KORRIGERING: Korrekta sökvägar till komponenter.
import { StatCard } from '@/components/dashboard/StatCard';
import { InfoCard } from '@/components/dashboard/InfoCard';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        // Om ingen session finns, omdirigera till startsidan.
        redirect('/');
    }

    // Onboarding-logik: Rörs ej. Säkerställer att nya användare går till onboarding.
    if (!session.user.onboardingComplete) {
        redirect('/onboarding');
    }

    return (
        <div>
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Välkommen tillbaka, {session.user.name?.split(' ')[0] || '!'}</h1>
                <p className="text-md text-text-secondary mt-1">Här är vad som händer i dina projekt idag.</p>
            </div>

            {/* Statistikkort */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                <StatCard title="Totalt antal projekt" value={0} />
                <StatCard title="Pågående projekt" value={0} main={true} description="Aktivt just nu" />
                <StatCard title="Totala intäkter (Fakturerat)" value="0.00 kr" />
            </div>

            {/* Informationskort */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
                <InfoCard 
                    icon={<FolderIcon className="h-6 w-6 text-text-secondary" />}
                    title="Du har inga aktiva projekt"
                    text="Skapa ett nytt projekt via"
                    ctaText="Skapa Nytt"
                />
                <InfoCard 
                    icon={<div className="relative"><InboxIcon className="h-6 w-6 text-text-secondary" /><SparklesIcon className="h-4 w-4 text-accent absolute -top-1 -right-1" /></div>}
                    title="Inkorgen är tom!"
                    text="Bra jobbat! Inga nya föreslagna åtgärder från din e-post just nu"
                    ctaText=""
                />
            </div>
        </div>
    );
}
