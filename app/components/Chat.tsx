'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '@/app/contexts/ChatContext';
import { useUI } from '@/app/contexts/UIContext';
import ButtonSuggestions from './ButtonSuggestions';
import { Message } from '@/app/components/messages/Message'; // KORRIGERAD IMPORT
import MessageSkeleton from '@/components/messages/MessageSkeleton';

// =================================================================================
// CHAT WIDGET V4.0 - ALIGNED WITH useCompletion
// REVISION:
// 1.  Removes the local `input` state and the manual `handleSend` function.
// 2.  Directly uses `input`, `handleInputChange`, and `handleSubmit` from the
//     `useChat` hook, which is now powered by `useCompletion`.
// 3.  The form now correctly uses the `handleSubmit` from the context.
// =================================================================================

const Chat = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat();
  const { isChatOpen } = useUI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-8 right-8 w-[450px] h-[600px] flex flex-col bg-component-background border border-border rounded-lg shadow-2xl font-sans z-50">
       <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">ByggPilot Co-Pilot</h2>
        <p className="text-sm text-text-secondary">Din digitala kollega, redo att hjälpa.</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        {isLoading && <MessageSkeleton />}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Skriv ett meddelande..."
              className="w-full bg-background border border-border rounded-md pl-4 pr-12 py-3 text-text-primary focus:ring-accent focus:border-accent"
              disabled={isLoading}
            />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-text-secondary hover:text-accent disabled:opacity-50" disabled={isLoading || !input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
