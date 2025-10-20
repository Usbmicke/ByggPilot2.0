
'use client';

import React, { useState, useTransition } from 'react';
import { completeOnboarding } from '@/app/actions/onboardingActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// =================================================================================
// ONBOARDING STEG 1 V2.0 - REFAKTORERAD (GULDSTANDARD)
// BESKRIVNING: Denna version är helt omskriven för att:
// 1. Anropa den nya, centraliserade `completeOnboarding` server action.
// 2. Använda standardiserade shadcn/ui-komponenter (Input, Button, Label).
// Detta löser `is not a function`-buggen och moderniserar UI-koden.
// =================================================================================

interface Step1ProfileProps {
    onCompleted: () => void; // Funktion för att gå till nästa steg
}

export default function Step1_Profile({ onCompleted }: Step1ProfileProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        orgNumber: '',
        address: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.companyName) {
            setError('Företagsnamn är obligatoriskt.');
            return;
        }

        startTransition(async () => {
            // ANROPAR DEN NYA, KORREKTA FUNKTIONEN
            const result = await completeOnboarding(1, formData);
            if (result.success) {
                onCompleted();
            } else {
                setError(result.error || 'Ett okänt fel uppstod vid sparande av profil.');
            }
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Vänster sida (Information & Motivation) */}
            <div className="text-center md:text-left animate-fade-in-right">
                <h1 className="text-4xl font-bold text-foreground mb-4">Berätta om ditt företag</h1>
                <p className="text-lg text-muted-foreground">
                    Allt börjar med ditt företagsnamn. Denna information används för att skapa din personliga mappstruktur i Google Drive och kommer att synas på dina framtida offerter och fakturor.
                </p>
                <p className="text-muted-foreground mt-4">
                    Du kan lägga till organisationsnummer och adress senare om du vill.
                </p>
            </div>

            {/* Höger sida (Formulär) */}
            <div className="bg-card border rounded-xl shadow-lg p-8 animate-fade-in-left">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="companyName">Företagsnamn *</Label>
                        <Input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleInputChange} required />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="orgNumber">Organisationsnummer</Label>
                        <Input type="text" name="orgNumber" id="orgNumber" value={formData.orgNumber} onChange={handleInputChange} />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="address">Adress</Label>
                        <Input type="text" name="address" id="address" value={formData.address} onChange={handleInputChange} />
                    </div>
                    
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    
                    <Button type="submit" disabled={isPending || !formData.companyName} size="lg" className="mt-4 w-full">
                        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparar...</> : 'Nästa'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
