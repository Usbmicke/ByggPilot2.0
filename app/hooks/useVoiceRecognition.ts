
'use client';

import { useState, useEffect, useCallback } from 'react';

// Denna hook hanterar Web Speech API för röstigenkänning.
export const useVoiceRecognition = (onTranscriptChange: (transcript: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initiera SpeechRecognition API när komponenten monteras
  useEffect(() => {
    // Kontrollera webbläsarstöd
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API stöds inte i denna webbläsare.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true; // Fortsätt lyssna
    rec.lang = 'sv-SE'; // Sätt språket till svenska
    rec.interimResults = false; // Vi vill bara ha det slutgiltiga resultatet

    // Hantera resultatet från API:et
    rec.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      // Anropa callback-funktionen med det igenkända talet
      onTranscriptChange(transcript);
    };

    rec.onerror = (event) => {
      console.error('Fel vid röstigenkänning:', event.error);
      setIsRecording(false);
    };

    rec.onend = () => {
      if (isRecording) {
        // Om inspelningen ska fortsätta, starta om den
        rec.start();
      } else {
        setIsRecording(false);
      }
    };

    setRecognition(rec);

    // Städa upp när komponenten avmonteras
    return () => {
      rec.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(() => {
    if (recognition && !isRecording) {
      console.log("Startar röstigenkänning...");
      recognition.start();
      setIsRecording(true);
    }
  }, [recognition, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognition && isRecording) {
      console.log("Stoppar röstigenkänning...");
      recognition.stop();
      setIsRecording(false);
    }
  }, [recognition, isRecording]);

  // Exponera tillstånd och kontroller
  return { isRecording, startRecording, stopRecording, browserSupportsSpeechRecognition: !!recognition };
};
