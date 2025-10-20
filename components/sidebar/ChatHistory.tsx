
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquareText } from 'lucide-react';

// =================================================================================
// CHAT HISTORY V2.0 - AKTIV LÄNK-STYLING
// REVIDERING: Använder nu `usePathname` för att dynamiskt styla den aktiva
// chatt-länken. Detta ger användaren tydlig visuell feedback om vilken
// konversation som för närvarande visas.
// =================================================================================

interface ChatHistoryProps {
    history: Array<{ id: string; title: string }>;
}

const ChatHistory = ({ history }: ChatHistoryProps) => {
    const pathname = usePathname();

    if (history.length === 0) {
        return (
            <div className="text-center text-sm text-muted-foreground mt-8">
                <p>Ingen historik än.</p>
                <p>Starta en ny chatt!</p>
            </div>
        );
    }

    return (
        <nav className="space-y-1">
            {history.map((chat) => {
                const isActive = pathname === `/chat/${chat.id}`;
                return (
                    <Link
                        key={chat.id}
                        href={`/chat/${chat.id}`}
                        className={cn(
                            buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }),
                            'w-full justify-start truncate'
                        )}
                    >
                        <MessageSquareText className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{chat.title}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default ChatHistory;
