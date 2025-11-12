
'use client';

import React, { useState, FormEvent } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Assuming your firebase app instance is exported from here
import { ChatMessages } from './ChatMessages';
import ChatInput from './ChatInput';
import { ChevronDownIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';

// Define the shape of a message
interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(app);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      // Optionally, show a message to the user to log in
      return;
    }

    const idToken = await user.getIdToken();
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/genkit/flows/chatRouterFlow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          // Genkit flows typically take an 'input' field
          input: {
            messages: newMessages,
          }
        }),
      });

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        modelResponse += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'model') {
            lastMessage.content = modelResponse;
            return [...prev.slice(0, -1), lastMessage];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error calling Genkit flow:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Ursäkta, ett fel inträffade." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-transform hover:scale-110 z-50 animate-fadeIn"
        aria-label="Öppna chatt"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-[450px] h-[70vh] max-h-[700px] bg-background-primary shadow-2xl rounded-2xl border border-border-color flex flex-col z-50 animate-slideInUp">
      <div className="flex justify-between items-center p-4 border-b border-border-color flex-shrink-0">
        <h3 className="font-bold text-lg">ByggPilot Co-Pilot</h3>
        <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-background-secondary rounded-full">
            <ChevronDownIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
         <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      <div className="p-4 border-t border-border-color flex-shrink-0">
        <form onSubmit={handleSubmit}>
            <ChatInput
                input={input}
                handleInputChange={(e) => setInput(e.target.value)}
                isLoading={isLoading}
                onStop={() => { /* Optional: Implement stop logic if needed */ }}
            />
        </form>
      </div>
    </div>
  );
}
