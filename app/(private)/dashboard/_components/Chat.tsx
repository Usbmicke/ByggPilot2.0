'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';

export default function Chat() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hej! Jag är ByggPilot, din digitala kollega. Vad kan jag hjälpa dig med idag?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGmailAction = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { from: 'user', text: 'Kör "Läs senaste mail & skapa händelse"' }]);

    if (!accessToken) {
      setMessages(prev => [...prev, { from: 'ai', text: 'Jag behöver en aktiv inloggning för att komma åt Google. Prova att logga in igen.' }]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Något gick fel på servern');
      }
      
      setMessages(prev => [...prev, { from: 'ai', text: data.message }]);

    } catch (error) {
      const errorMessage = (error as Error).message;
      setMessages(prev => [...prev, { from: 'ai', text: `Ett fel uppstod: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-800 rounded-lg shadow-2xl flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Chatta med ByggPilot</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 ${msg.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
         {isLoading && <div className="text-gray-400 italic">ByggPilot arbetar...</div>}
      </div>
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleGmailAction}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors mb-2"
        >
          Läs senaste mail & skapa händelse
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Skriv ditt meddelande..."
          className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
