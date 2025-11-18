
'use client';

import { type UIMessage } from '@ai-sdk/react';
import { UserIcon, CogIcon } from '@heroicons/react/24/solid';

export function ChatMessages({ messages, isLoading }: { messages: UIMessage[], isLoading: boolean }) {
  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-text-primary">Välkommen till ByggPilot AI</h2>
          <p className="mt-1 text-sm text-text-secondary">Ställ en fråga för att komma igång.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((m, index) => (
        <div key={m.id || index} className={`flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
          {m.role === 'assistant' && (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
              <CogIcon className="h-5 w-5" />
            </div>
          )}
          <div className={`rounded-lg px-4 py-2 max-w-lg break-words ${m.role === 'user' ? 'bg-primary-500 text-white' : 'bg-background-secondary'}`}>
           <p> {m.content} </p>
          </div>
          {m.role === 'user' && (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-600" />
            </div>
          )}
        </div>
      ))}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
              <CogIcon className="h-5 w-5" />
            </div>
            <div className="rounded-lg px-4 py-2 max-w-lg break-words bg-background-secondary">
              <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-primary-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-primary-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-primary-400 rounded-full"></div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
