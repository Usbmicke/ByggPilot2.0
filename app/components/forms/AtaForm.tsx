
'use client';

import { useState } from 'react';
import { useActions } from 'ai/rsc';
import { AI } from '@/app/action';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// =================================================================================
// ATA FORM COMPONENT V1.0 - GULDSTANDARD
// BESKRIVNING: Ett dynamiskt formulär som renderas i chatten av AI:n.
// Byggt med shadcn/ui för ett enhetligt utseende. Formuläret hanterar
// state lokalt och anropar en server action (via useActions) vid submit.
// =================================================================================

export default function AtaForm() {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const { submit } = useActions<typeof AI>();

    const handleSubmit = async () => {
        // Här skulle du normalt anropa en server action för att spara datan.
        // För detta exempel simulerar vi bara en bekräftelse.
        const confirmationMessage = `ÄTA skapad för projekt "${projectName}" med beskrivningen "${description}" och värdet ${value} kr.`;
        
        // Använd `submit` för att skicka tillbaka bekräftelsen till chattfönstret
        await submit(confirmationMessage);
    };

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Skapa ny ÄTA</CardTitle>
                <CardDescription>Fyll i informationen nedan för att registrera en ny ändring, tillägg eller avgående.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="project-name">Projektnamn</Label>
                    <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ange projektnamn" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="description">Beskrivning</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beskrivning av ÄTA:n" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="value">Värde (SEK)</Label>
                    <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ange värde i kronor" />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} className="w-full">Skapa ÄTA</Button>
            </CardFooter>
        </Card>
    );
}
