'use client';

import { useActions, useUIState } from 'ai/rsc';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { AI } from '@/app/action';

// =================================================================================
// ATA FORM V1.0 - GULDSTANDARD
// BESKRIVNING: Denna komponent renderar ett formulär för att skapa en ÄTA.
// Den hanterar sitt eget tillstånd och skulle i en fullständig implementation
// anropa en server-action för att spara datan. För nu är det en UI-komponent
// som renderas av AI-systemet.
// =================================================================================

export default function AtaForm() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const { submit } = useActions<typeof AI>();
  const [_, setMessages] = useUIState<typeof AI>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = `En ÄTA för projekt \"${projectName}\" med beskrivning \"${description}\" och värde ${value} kr har skapats.`;
    
    setMessages(currentMessages => [
        ...currentMessages,
        {
            id: Date.now(),
            role: 'assistant',
            display: <div>{message}</div>
        }
    ]);

    setProjectName('');
    setDescription('');
    setValue('');
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Skapa ny ÄTA</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Projektnamn</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ange projektnamn"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv ändringen"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Värde (SEK)</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ange kostnad"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Skapa ÄTA</Button>
        </CardFooter>
      </form>
    </Card>
  );
}