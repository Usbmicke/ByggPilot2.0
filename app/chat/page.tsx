
import ChatWindow from '@/components/chat/ChatWindow';
import { getUserStatus } from '@/lib/data-access';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// =================================================================================
// NY CHATT-SIDA (v1.0 - Guldstandard)
// Denna sida renderar ett tomt chatt-fönster.
// useChatHandler kommer att skapa en ny chatt-session vid första meddelandet.
// =================================================================================

export default async function NewChatPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    // Kolla om användaren har slutfört onboarding
    const { onboardingComplete } = await getUserStatus(session.user.id);
    if (!onboardingComplete) {
        redirect('/onboarding');
    }

    return (
        <main className="h-screen bg-gray-900">
            <ChatWindow 
                initialMessages={[]}
                chatId={null}
            />
        </main>
    );
}
