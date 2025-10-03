
'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/app/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Funktion för att justera höjden på textarea baserat på innehållet
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Återställ höjden
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSendMessage = () => {
    if (content.trim() && !isLoading) {
      onSendMessage(content);
      setContent(''); // Rensa fältet efter sändning
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Skicka meddelande på Enter, men tillåt ny rad med Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Förhindra att en ny rad skapas
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Skriv ditt meddelande..."
        className="flex-1 p-2 border rounded-md resize-none overflow-hidden bg-gray-100 dark:bg-gray-700 dark:text-white transition-all duration-150"
        rows={1}
        disabled={isLoading}
      />
      <Button onClick={handleSendMessage} disabled={isLoading || !content.trim()}>
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatInput;
