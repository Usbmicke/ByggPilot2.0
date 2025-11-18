
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mic, AlertTriangle } from 'lucide-react';
import { callGenkitFlow } from '@/lib/genkit'; // Importera vår nya hjälpfunktion

// Typer för input och output till flödet
interface AudioToAtaInput {
  audioUrl: string;
  projectId: string; // Hårdkodat för demo
}

interface AudioToAtaOutput {
  ataId: string;
  message: string;
}

const AudioToAtaCard = () => {
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AudioToAtaOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!audioUrl) {
      setError('Du måste ange en URL till ljudfilen.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const inputData: AudioToAtaInput = {
        audioUrl,
        projectId: 'P-123' // Hårdkodat för demonstration
      };
      
      const response = await callGenkitFlow<AudioToAtaInput, AudioToAtaOutput>('audioToAtaFlow', inputData);
      setResult(response);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="mr-2" />
          Röst till ÄTA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">Spela in en ljudfil där du beskriver ett ÄTA-arbete. AI:n transkriberar, analyserar och skapar ett komplett ÄTA-underlag automatiskt.</p>
        <div className="space-y-4">
          <Input 
            type="text" 
            placeholder="URL till ljudfil (t.ex. en .mp3)" 
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !audioUrl}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Skapa ÄTA'}
          </Button>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
            <h4 className="font-semibold">Klart!</h4>
            <p>{result.message} (ID: {result.ataId})</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioToAtaCard;
