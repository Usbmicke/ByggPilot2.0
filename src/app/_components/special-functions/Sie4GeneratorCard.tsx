
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Book, Download, AlertTriangle } from 'lucide-react';
import { callGenkitFlow } from '@/lib/genkit';

// Typdefinitioner
interface GenerateSie4Input {
  projectId: string;
}

type GenerateSie4Output = string; // Förväntar oss en URL som en sträng

const Sie4GeneratorCard = () => {
  const [projectId, setProjectId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!projectId) {
      setError('Ange ett projekt-ID först.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const downloadUrl = await callGenkitFlow<GenerateSie4Input, GenerateSie4Output>('generateSie4Flow', { projectId });
      setResult(downloadUrl);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid generering av SIE 4-filen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book className="mr-2" />
          SIE-4 Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">Generera en bokföringsfil i SIE 4-format för ett specifikt projekt. Filen kan sedan importeras direkt in i ditt bokföringsprogram.</p>
        <div className="space-y-4">
          <Input 
            type="text" 
            placeholder="Ange Projekt-ID (t.ex. P-123)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !projectId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generera SIE-4 Fil'}
          </Button>
        </div>
        {result && (
          <div className="mt-4">
            <a 
              href={result} 
              download={`bokforing_${projectId}.se`} // Filnamn för nedladdningen
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="mr-2 h-4 w-4"/> Ladda ner SIE-4 fil
            </a>
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

export default Sie4GeneratorCard;
