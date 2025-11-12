
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, TrendingUp, AlertTriangle } from 'lucide-react';
import { callGenkitFlow } from '@/lib/genkit';

// Typdefinition för input och output
interface SpillAnalysisInput {
  imageUrl: string;
}

interface CutPlan {
  description: string;
  estimatedSavings: number;
  cuts: { piece: string; length: number; from: string }[];
}

const SpillAnalysisCard = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!imageUrl) {
      setError('Ange en bild-URL först.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await callGenkitFlow<SpillAnalysisInput, CutPlan>('analyzeSpillWasteFlow', { imageUrl });
      setResult(response);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod vid analysen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="mr-2" />
          Spillanalys
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">Ladda upp en bild på överblivet material. AI:n analyserar spillbitarna och föreslår en optimerad kapningsplan för att maximera återanvändningen.</p>
        <div className="space-y-4">
          <Input 
            type="text" 
            placeholder="URL till bild på spillmaterial..." 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !imageUrl}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Analysera Spill'}
          </Button>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800">Resultat: {result.description}</h4>
            <p className="text-sm text-green-600 font-bold flex items-center"><TrendingUp className="mr-1 h-4 w-4"/> Sparpotential: ~{result.estimatedSavings}%</p>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
              {result.cuts.map((cut, i) => <li key={i}>{`Kapa ${cut.piece} (${cut.length}m) från ${cut.from}`}</li>)}
            </ul>
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

export default SpillAnalysisCard;
