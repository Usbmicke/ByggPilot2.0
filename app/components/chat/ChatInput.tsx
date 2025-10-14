
'use client';

import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';

export function ChatInput() {
    const [inputValue, setInputValue] = useState('');
    const { append, isLoading } = useChat(); // Använder nu 'append'

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            append(inputValue.trim()); // Anropar 'append'
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Skriv ditt meddelande..."
                disabled={isLoading}
                style={{
                    flexGrow: 1, 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    backgroundColor: '#2d2d2d', // Mörkare bakgrundsfärg
                    color: '#e0e0e0' // Ljusare textfärg
                }}
            />
            <button 
                type="submit" 
                disabled={isLoading} 
                style={{
                    marginLeft: '8px', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    border: 'none', 
                    background: '#007bff', 
                    color: 'white',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? 'Vänta...' : 'Skicka'}
            </button>
        </form>
    );
}
