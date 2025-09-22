
'use client';

import { PaperAirplaneIcon, ArrowUpOnSquareIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
import { addDoc, collection, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { db, auth } from '@/app/lib/firebase/client';
import { Message, ChatMessage, FlowState } from '@/app/types';
import { onAuthStateChanged, User } from 'firebase/auth';
import WelcomeMessage from './WelcomeMessage';

const ChatWidget = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [flowState, setFlowState] = useState<FlowState | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('[ChatWidget] Firebase-användare inloggad:', user.uid);
        setFirebaseUser(user);
      } else {
        console.log('[ChatWidget] Firebase-användare utloggad.');
        setFirebaseUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>, directAction?: string) => {
    if (e) e.preventDefault();
    if (!firebaseUser) return;

    const messageText = input.trim();
    if (messageText === '' && !directAction) return;

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          action: directAction,
          flowState: flowState,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      // **KORRIGERING: Läs 'reply'-objektet från svaret**
      const data = await response.json();
      const assistantMessage: ChatMessage = data.reply;

      setMessages(prev => [...prev, assistantMessage]);
      if (assistantMessage.flowState) {
        setFlowState(assistantMessage.flowState);
      }

    } catch (error: any) {
      console.error('Fel vid anrop till orkestreraren:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Ett fel uppstod: ${error.message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleButtonClick = (action: string) => {
    handleSendMessage(undefined, action);
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-lg p-4 text-white">
      <div className="flex-1 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <WelcomeMessage onButtonClick={handleButtonClick} />
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`my-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg p-2 max-w-md`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="my-2 flex justify-start">
            <div className="bg-gray-700 rounded-lg p-2 max-w-md animate-pulse">...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!firebaseUser || isLoading} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">
          <ArrowUpOnSquareIcon className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => console.log("Mic clicked")} disabled={!firebaseUser || isLoading} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">
          <MicrophoneIcon className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={!firebaseUser ? 'Logga in för att chatta' : isLoading ? 'Tänker...' : 'Skapa ett nytt projekt...'}
          disabled={!firebaseUser || isLoading}
          className="flex-1 bg-gray-800 rounded-full py-2 px-4 focus:outline-none disabled:opacity-50"
        />
        <button type="submit" disabled={!firebaseUser || isLoading || !input.trim()} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
