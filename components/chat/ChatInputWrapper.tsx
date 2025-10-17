
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { ChangeEvent, FormEvent } from 'react';

interface ChatInputWrapperProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function ChatInputWrapper({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputWrapperProps) {
  return (
    <div className="p-4 bg-gray-800/50 border-t border-gray-700">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Beskriv vad du vill göra eller fråga..."
          className="flex-1 resize-none rounded-lg border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:ring-cyan-500"
          disabled={isLoading}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
            }
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 rounded-lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
