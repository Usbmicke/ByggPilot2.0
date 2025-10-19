
import ChatWindow from '@/components/chat/ChatWindow';
import { getChatMessages, getUserStatus } from '@/lib/data-access';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// =================================================================================
// SPECIFIK CHATT-SIDA (v1.0 - Guldstandard)
// Denna serverkomponent hämtar historiken för en specifik chatt
// och skickar den till den "dumma" ChatWindow-komponenten.
// =================================================================================

interface ChatPageProps {
    params: {
        chatId: string;
    };
}

export default async function SpecificChatPage({ params }: ChatPageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    // Kolla om användaren har slutfört onboarding
    const { onboardingComplete } = await getUserStatus(session.user.id);
    if (!onboardingComplete) {
        redirect('/onboarding');
    }

    // Hämta meddelandehistoriken för denna chatt från DAL
    const initialMessages = await getChatMessages(session.user.id, params.chatId);

    return (
        <main className="h-screen bg-gray-900">
            <ChatWindow 
                initialMessages={initialMessages}
                chatId={params.chatId}
            />
        </main>
    );
}
