
import ChatHistory from '@/components/sidebar/ChatHistory';
import { getUserStatus } from '@/lib/data-access';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// =================================================================================
// CHAT LAYOUT (v1.0 - Platinum Standard)
//
// Beskrivning: Denna layout omsluter alla chatt-relaterade sidor.
// Den ansvarar för:
// - Sessions- och onboarding-validering (sker nu på ett ställe).
// - Rendera den gemensamma sidomenyn för chatt-historik.
// =================================================================================

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const { onboardingComplete } = await getUserStatus();
    if (!onboardingComplete) {
        redirect('/onboarding');
    }

    return (
        <div className="flex h-screen bg-background-primary text-foreground">
            <aside className="w-1/4 max-w-sm bg-background-secondary p-4">
                <ChatHistory />
            </aside>
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
