
'use client';

import { useState, useEffect, useCallback } from 'react';

// Denna hook hanterar Web Speech API för röstigenkänning.
export const useVoiceRecognition = (onTranscriptChange: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false); // Byt namn från isRecording till isListening
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null); // Lägg till ett error-tillstånd

  // Initiera SpeechRecognition API när komponenten monteras
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API stöds inte i denna webbläsare.');
      setError('Web Speech API stöds inte i denna webbläsare.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.lang = 'sv-SE';
    rec.interimResults = false;

    rec.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      onTranscriptChange(transcript);
    };

    rec.onerror = (event) => {
      console.error('Fel vid röstigenkänning:', event.error);
      setError(`Fel vid röstigenkänning: ${event.error}`);
      setIsListening(false);
    };

    rec.onend = () => {
      // Behåll isListening-tillståndet (starta inte om automatiskt här)
      setIsListening(false);
    };

    setRecognition(rec);

    return () => {
        if (rec) {
            rec.stop();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback(() => { // Byt namn från startRecording till startListening
    if (recognition && !isListening) {
      console.log("Startar röstigenkänning...");
      setError(null);
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => { // Byt namn från stopRecording till stopListening
    if (recognition && isListening) {
      console.log("Stoppar röstigenkänning...");
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  // Exponera tillstånd och kontroller med korrekta namn
  return { 
    isListening, 
    startListening, 
    stopListening, 
    error, 
    browserSupportsSpeechRecognition: !!recognition 
  };
};
