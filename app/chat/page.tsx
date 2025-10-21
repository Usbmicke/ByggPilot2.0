
import ChatInterface from '@/components/chat/ChatInterface';
import { getUserStatus } from '@/lib/data-access';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// =================================================================================
// NY CHATT-SIDA (v2.0 - Moderniserad)
// Denna sida renderar det nya ChatInterface.
// Den förlitar sig på den uppdaterade useChatHandler-hooken som använder AI SDK v3.
// =================================================================================

export default async function NewChatPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    // Kolla om användaren har slutfört onboarding
    // Notera: Denna logik kan flyttas till middleware för en renare lösning
    const { onboardingComplete } = await getUserStatus(session.user.id);
    if (!onboardingComplete) {
        redirect('/onboarding');
    }

    return (
        <main className="h-screen bg-background-primary">
            {/* ChatInterface kräver inte längre initiala props */}
            <ChatInterface />
        </main>
    );
}
