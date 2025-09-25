
'use client';

import React, { useState, useRef } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, MicrophoneIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import useVoiceRecognition from '@/app/hooks/useVoiceRecognition';

interface MessageInputProps {
  onSendMessage: (message: { text: string; files?: File[] }) => void;
  // TODO: Lägg till props för att hantera AI-förslag etc.
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranscript = (transcript: string) => {
    setText(prev => prev + transcript);
  };

  const { isRecording, startRecording, stopRecording, browserSupportsSpeechRecognition } = useVoiceRecognition(handleTranscript);

  const handleSend = () => {
    if (text.trim() === '' && files.length === 0) return;
    onSendMessage({ text, files });
    setText('');
    setFiles([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
      // Här kan man visa en förhandsgranskning av filerna om man vill
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="bg-background-secondary border-t border-border-primary px-4 py-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Skriv ditt meddelande eller prata direkt..."
          className="w-full bg-background-primary border border-border-primary rounded-lg pl-12 pr-28 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue transition-colors"
          rows={1}
        />

        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="text-text-secondary hover:text-text-primary">
            <PaperClipIcon className="h-6 w-6" />
          </button>
          <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} className="hidden" />

          {browserSupportsSpeechRecognition && (
             <button onClick={toggleRecording} className={`text-text-secondary hover:text-text-primary ${isRecording ? 'text-accent-red' : ''}`}>
                {isRecording ? <StopCircleIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
            </button>
          )}
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2">
           <button
            onClick={handleSend}
            disabled={text.trim() === '' && files.length === 0}
            className="bg-accent-blue text-white rounded-full p-2 hover:bg-accent-blue-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
       {/* TODO: Visa förhandsgranskning av valda filer här */}
       {files.length > 0 && (
        <div className="mt-2 text-xs text-text-secondary">
          {files.length} fil(er) valda: {files.map(f => f.name).join(', ')}
        </div>
      )}
    </div>
  );
};

export default MessageInput;

