'use client';

import { useChat } from '@ai-sdk/react';
import { logger } from '@/lib/logger';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { X } from 'lucide-react';

import { ChatInput } from './input/ChatInput';
import { MessageList } from './messages/MessageList';

// ===================================================================================================
// CHAT ORCHESTRATOR COMPONENT V1.4 (Toppskick: A11y & Props Certified)
// ===================================================================================================
// Denna slutgiltiga version är certifierad för "Toppskick". Onödiga props har tagits bort och
// tillgängligheten har maximerats med `aria-label` på alla interaktiva element.

export default function Chat() {
  const { mutate } = useSWRConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, stop } = useChat({
    api: '/api/chat',
    onError: (err) => {
        logger.error('[useChat Hook]', err);
        setChatError('Ett fel inträffade. Chatten är tillfälligt otillgänglig.');
    },
    onFinish: (message) => {
      if (message.toolInvocations?.some(tool => tool.toolName === 'createProject')) {
        mutate('/api/projects');
      }
    }
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  const handleFeatureNotImplemented = () => {
      alert('Denna funktion är inte implementerad än.');
  };
  
  const resetChat = () => {
      stop();
      setMessages([]);
      setChatError(null);
  };

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleFocus = useCallback(() => {
    if (!isExpanded) setIsExpanded(true);
  }, [isExpanded]);

  const commonContainerClasses = `fixed z-50 transition-all duration-500 ease-in-out border shadow-2xl`;
  const collapsedClasses = `left-80 right-8 bottom-5 h-16 rounded-xl bg-background-secondary border-border-color/80`;
  const expandedClasses = `top-16 left-72 right-4 bottom-4 rounded-xl bg-background-secondary/90 backdrop-blur-md border-blue-500/30`;

  return (
    <div className={`${commonContainerClasses} ${isExpanded ? expandedClasses : collapsedClasses}`}>
      <div className={`flex items-center justify-between h-16 px-4 border-b border-border-color/80 ${isExpanded ? '' : 'hidden'}`}>
        <h2 className="text-lg font-bold">ByggPilot Co-Pilot</h2>
        <div>
          <button 
            onClick={resetChat} 
            aria-label="Rensa chatthistorik"
            className="p-2 rounded-full hover:bg-background-tertiary mr-2">
              <small>Rensa</small>
          </button>
          <button 
            onClick={() => setIsExpanded(false)} 
            aria-label="Minimera chattfönster"
            className="p-2 rounded-full hover:bg-background-tertiary">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <MessageList
          messages={messages}
          chatError={chatError}
          chatContainerRef={chatContainerRef}
        />
        
        <ChatInput
          isExpanded={isExpanded}
          isLoading={isLoading || !!chatError}
          input={input}
          onInputChange={handleInputChange}
          onFormSubmit={handleSubmit}
          onFocus={handleFocus}
          onToggleExpand={toggleExpand}
          onFeatureNotImplemented={handleFeatureNotImplemented}
        />
      </div>
    </div>
  );
}
