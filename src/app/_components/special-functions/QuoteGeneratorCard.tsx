
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, AlertTriangle } from 'lucide-react';
import { callGenkitFlow } from '@/lib/genkit';

// Typdefinitioner
interface GenerateQuoteInput {
  prompt: string;
  projectId: string; // Hårdkodat för demo
}

type GenerateQuoteOutput = string; // Förväntar oss offert-ID som en sträng

const QuoteGeneratorCard = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt) {
      setError('Skriv en beskrivning för offerten först.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: GenerateQuoteInput = {
        prompt,
        projectId: 'P-456' // Hårdkodat för demo
      };

      const quoteId = await callGenkitFlow<GenerateQuoteInput, GenerateQuoteOutput>('generateQuoteFlow', input);
      setResult(quoteId);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid generering av offerten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2" />
          Offertgenerator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">Beskriv jobbet som ska utföras. AI:n använder företagets och branschens kunskapsdatabaser för att generera ett komplett, professionellt offertförslag.</p>
        <div className="space-y-4">
          <Textarea 
            placeholder="Exempel: Totalrenovering av badrum 10kvm i Stockholm. Inkluderar rivning, VVS, el, kakel och klinker..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !prompt}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generera Offert'}
          </Button>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
            <h4 className="font-semibold">Offert skapad!</h4>
            <p>Ett nytt utkast till offert har skapats med ID: <strong>{result}</strong></p>
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

export default QuoteGeneratorCard;
