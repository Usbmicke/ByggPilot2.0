
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hämta historik vid första laddning
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat/history');
        if (response.ok) {
          const data = await response.json();
          setMessages(data.history || []);
        }
      } catch (error) {
        console.error('Kunde inte hämta chatthistorik', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Scrolla till botten när nya meddelanden läggs till
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }), // Skicka med hela kontexten
      });

      if (!response.ok) throw new Error('Något gick fel med API-anropet');
      
      const modelResponse = await response.json();
      setMessages(prev => [...prev, modelResponse]);

    } catch (error) {
      console.error('Fel vid sändning av meddelande:', error);
      const errorMessage: Message = {
        role: 'model',
        parts: [{ text: 'Ursäkta, jag stötte på ett problem. Försök igen.' }],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <p>{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        {isLoading && <p className="text-center text-gray-400">ByggPilot tänker...</p>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv ditt meddelande..."
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </form>
    </div>
  );
};

export default ChatWindow;
