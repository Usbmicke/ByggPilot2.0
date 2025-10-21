
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types';
import { PlusCircle } from 'lucide-react';

// =================================================================================
// CHAT HISTORY (Klientkomponent) (v1.0 - Platinum Standard)
//
// Beskrivning: Denna klientkomponent renderar listan över användarens chattar.
// Den hanterar aktiv-state för länkar och ger en tydlig visuell hierarki.
// =================================================================================

interface ChatHistoryClientProps {
    chats: Chat[];
}

export default function ChatHistoryClient({ chats }: ChatHistoryClientProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full">
            <div className="p-2">
                <Link href="/chat" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ny Chatt
                    </Button>
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 space-y-1 mt-4">
                <h2 className="px-2 mb-2 text-lg font-semibold tracking-tight text-muted-foreground">
                    Historik
                </h2>
                {chats.length > 0 ? (
                    chats.map((chat) => {
                        const isActive = pathname === `/chat/${chat.id}`;
                        return (
                            <Link
                                key={chat.id}
                                href={`/chat/${chat.id}`}
                                className={cn(
                                    'block w-full text-left px-3 py-2 rounded-md text-sm font-medium truncate',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted/50'
                                )}
                            >
                                {chat.title || 'Okänd Chatt'}
                            </Link>
                        );
                    })
                ) : (
                    <div className="p-3 text-sm text-muted-foreground italic">
                        Du har inga tidigare konversationer.
                    </div>
                )}
            </nav>
        </div>
    );
}

