
'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { LogOut, MessageSquarePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useRouter } from 'next/navigation';
import ChatHistory from './ChatHistory';
import UserProfile from './UserProfile';
import { useConversations } from '@/hooks/useConversations';

// =================================================================================
// SIDEBAR V3.1 - CLIENT-SIDE DATA FETCHING
// REVIDERING: Bytt från att ta emot props till att använda den nya
// `useConversations`-hooken. Detta gör komponenten mer självständig och
// drar nytta av `react-query` för caching och realtidsuppdateringar.
// =================================================================================

const Sidebar = () => {
    const router = useRouter();
    const { data: session } = useSession();
    
    // Hämta konversationer med den nya hooken
    const { data: conversations, isLoading, isError } = useConversations();

    const handleNewChat = () => {
        router.push('/chat');
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <aside className="flex flex-col h-full bg-background-secondary text-foreground p-4 w-64 border-r border-border-primary">
            {/* Övre sektionen: Ny chatt-knapp */}
            <div className="mb-4">
                <Button onClick={handleNewChat} className="w-full justify-start">
                    <MessageSquarePlus className="mr-2 h-5 w-5" />
                    Ny chatt
                </Button>
            </div>

            {/* Mellersta sektionen: Scrollbar chatt-historik */}
            <div className="flex-1 overflow-y-auto -mr-4 pr-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : isError ? (
                    <div className="text-center text-sm text-red-500 mt-8">
                        <p>Kunde inte ladda historik.</p>
                    </div>
                ) : (
                    <ChatHistory history={conversations || []} />
                )}
            </div>

            {/* Nedre sektionen: Användarprofil och inställningar */}
            <div className="mt-auto">
                <div className="space-y-2">
                    {session?.user && <UserProfile user={session.user} />}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                            <LogOut className="mr-2 h-5 w-5" />
                            Logga ut
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
