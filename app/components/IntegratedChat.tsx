'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '@/app/contexts/ChatContext';
import { useUI } from '@/app/contexts/UIContext';
import { Message } from '@/app/components/messages/Message';
import MessageSkeleton from '@/components/messages/MessageSkeleton';
import { ChevronUpIcon, ChevronDownIcon, PlusCircleIcon, UserPlusIcon, DocumentPlusIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// New Component for Quick Action Buttons
const QuickActionButton = ({ label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="flex-1 bg-background hover:bg-background-tertiary text-text-primary py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 border border-border text-sm min-w-max"
  >
    {icon}
    <span>{label}</span>
  </button>
);

const IntegratedChat = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat();
  const { isChatOpen, toggleChat } = useUI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const quickActions = [
    { label: "Nytt projekt", command: "Skapa ett nytt projekt", icon: <PlusCircleIcon className="w-5 h-5" /> },
    { label: "Ny kund", command: "Skapa en ny kund", icon: <UserPlusIcon className="w-5 h-5" /> },
    { label: "Ny offert", command: "Skapa en ny offert", icon: <DocumentPlusIcon className="w-5 h-5" /> },
    { label: "Ny faktura", command: "Skapa en ny faktura", icon: <CurrencyDollarIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-64 z-40 bg-component-background border-t border-border shadow-lg font-sans">
      {/* Header to toggle chat visibility */}
      <div onClick={toggleChat} className="flex justify-between items-center p-3 cursor-pointer hover:bg-background-tertiary">
        <h2 className="text-lg font-semibold text-text-primary">ByggPilot Co-Pilot</h2>
        <p className="text-sm text-text-secondary">Din digitala kollega, redo att hjälpa.</p>
        <button className="p-1 text-text-secondary hover:text-text-primary">
          {isChatOpen ? <ChevronDownIcon className="w-6 h-6" /> : <ChevronUpIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Collapsible Chat Area */}
      {isChatOpen && (
        <>
          <div className="h-[400px] p-4 overflow-y-auto space-y-4 border-t border-border">
            {(messages || []).map((m) => (
              <Message key={m.id} message={m} />
            ))}
            {isLoading && <MessageSkeleton />}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            {/* Quick Actions Section */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {quickActions.map(action => (
                <QuickActionButton 
                  key={action.label}
                  label={action.label}
                  icon={action.icon}
                  onClick={() => setInput(action.command)}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Skriv ett meddelande eller välj en åtgärd..."
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
        </>
      )}
    </div>
  );
};

export default IntegratedChat;
