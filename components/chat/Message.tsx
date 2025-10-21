
'use client';

import { CoreMessage } from 'ai';
import { Bot, User, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// =================================================================================
// ENKELT MEDDELANDE (v1.1 - Färg- & Roll-korrigering)
//
// Beskrivning: Renderar ett enskilt meddelande med korrekta stilar. Ignorerar
//              icke-visningsbara meddelanden som 'tool' och 'system'.
// =================================================================================

interface MessageProps {
  message: CoreMessage;
}

export function Message({ message }: MessageProps) {
  // Ignorera rendering av icke-synliga meddelandetyper
  if (message.role !== 'user' && message.role !== 'assistant') {
    return null;
  }

  const isAssistant = message.role === 'assistant';

  // Säkerställ att innehållet är en sträng för rendering
  const content = typeof message.content === 'string' 
    ? message.content 
    : JSON.stringify(message.content);

  return (
    <div className={cn('flex items-start gap-3', !isAssistant && 'justify-end')}>
      {/* Avatar för Assistent */}
      {isAssistant && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 flex-shrink-0">
          <Bot size={18} className="text-gray-300" />
        </div>
      )}
      
      {/* Meddelandebubbla */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 max-w-[80%] whitespace-pre-wrap',
          isAssistant
            ? 'bg-gray-700 text-gray-200 rounded-bl-lg'
            : 'bg-sky-500 text-white rounded-br-lg'
        )}
      >
        {/* Använd en mer avancerad markdown-renderer i framtiden om det behövs */}
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      {/* Avatar för Användare */}
      {!isAssistant && (
         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 flex-shrink-0">
          <User size={18} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}
