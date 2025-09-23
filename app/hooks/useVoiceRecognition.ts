'use client';

import { useState, useEffect, useRef } from 'react';

// Definierar gränssnittet för taligenkänning för att inkludera TypeScript-stöd
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// Deklarerar SpeechRecognition-konstruktorn på window-objektet
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Hooken returnerar status och funktioner för att kontrollera röstigenkänning
export const useVoiceRecognition = (onTranscript: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Kontrollerar webbläsarstöd vid montering
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Röstigenkänning stöds inte i din webbläsare.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Fortsätt lyssna även efter pauser
    recognition.interimResults = true; // Få resultat medan användaren pratar
    recognition.lang = 'sv-SE'; // Sätt språket till svenska

    // Hanterar resultat från API:et
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    // Hanterar fel
    recognition.onerror = (event) => {
      console.error('Fel vid röstigenkänning:', event.error);
      setError(`Fel: ${event.error}`);
      setIsListening(false);
    };

    // Återställer status när lyssningen avslutas
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Städfunktion för att säkerställa att lyssningen avbryts när komponenten avmonteras
    return () => {
      recognition.stop();
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, error, startListening, stopListening };
};
