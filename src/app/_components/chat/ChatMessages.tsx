
lö'use client';

import { UserIcon } from '@heroicons/react/24/solid';
import { type Message } from './Chat'; // GULDSTANDARD v5.0: Importera från vår EGEN komponent
import Image from 'next/image';

const AIMessageBubble = ({ content }: { content: string }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-neutral-700/80 flex items-center justify-center border border-neutral-600">
            <Image src="/byggpilot-logo-icon-light.svg" alt="ByggPilot AI Ikon" width={20} height={20} />
        </div>
        <div className="rounded-2xl px-4 py-2.5 bg-[#3A3A3C] text-gray-200 max-w-xl break-words shadow-md">
            <p className="whitespace-pre-wrap">{content}</p>
        </div>
    </div>
);

const UserMessageBubble = ({ content }: { content: string }) => (
    <div className="flex justify-end items-start gap-3">
        <div className="rounded-2xl px-4 py-2.5 bg-indigo-600 text-white max-w-xl break-words shadow-md">
            <p>{content}</p>
        </div>
        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-neutral-700 flex items-center justify-center border border-neutral-600">
            <UserIcon className="h-5 w-5 text-gray-300" />
        </div>
    </div>
);

const LoadingBubble = () => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-neutral-700/80 flex items-center justify-center border border-neutral-600">
            <Image src="/byggpilot-logo-icon-light.svg" alt="ByggPilot AI Ikon" width={20} height={20} />
        </div>
        <div className="rounded-2xl px-4 py-2.5 bg-[#3A3A3C] text-gray-200">
            <div className="flex items-center justify-center space-x-1.5">
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

const WelcomeMessage = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <Image src="/byggpilot-logo-icon-light.svg" alt="ByggPilot AI Ikon" width={48} height={48} className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-200">Välkommen till ByggPilot AI</h2>
        <p className="mt-2 text-sm text-gray-400 max-w-sm">
            Jag är din personliga assistent. Du kan be mig om allt från att skapa ett nytt projekt till att sammanställa en materiallista. Vad vill du göra idag?
        </p>
    </div>
);


export function ChatMessages({ messages, isLoading }: { messages: Message[], isLoading: boolean }) {
  if (!messages.length) {
    return <WelcomeMessage />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((m) => (
          m.role === 'user' 
            ? <UserMessageBubble key={m.id} content={m.content} />
            : <AIMessageBubble key={m.id} content={m.content} />
      ))}
      {isLoading && <LoadingBubble />}
    </div>
  );
}
