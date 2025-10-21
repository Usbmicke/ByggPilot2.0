
'use client';

import { useActions, useUIState } from 'ai/rsc';
import { AI } from '@/app/actions/chat'; // Assuming this is the new AI definition file
import { useState, useTransition } from 'react';

// =================================================================================
// HOOK FÖR CHATT-HANTERING (v3.0 - Moderniserad med useActions)
// Denna hook använder nu Vercel AI SDK:s `useActions` och `useUIState` för att
// hantera interaktioner. Detta förenklar kodbasen avsevärt och förbereder
// för mer avancerade, server-drivna funktioner.
// =================================================================================

export function useChatHandler() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submit } = useActions<typeof AI>();
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    startTransition(async () => {
      // Add user message to UI state
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: Date.now(),
          display: <div>{input}</div>,
          role: 'user',
        },
      ]);

      // Call the server action
      const responseMessage = await submit(input);

      // Add server response to UI state
      setMessages(currentMessages => [...currentMessages, responseMessage]);

      setInput('');
    });
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isPending,
  };
}
