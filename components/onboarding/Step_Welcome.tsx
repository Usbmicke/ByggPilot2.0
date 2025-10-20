
'use client';

import React, { useState } from 'react';
import { ArrowRight, Info, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // <-- Importerar den standardiserade knappen

interface Step_WelcomeProps {
    userName: string;
    onProceed: () => void;
    onSkip: () => void;
    onShowSecurity: () => void;
    error: string | null;
}

export default function Step_Welcome({ userName, onProceed, onSkip, onShowSecurity, error }: Step_WelcomeProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleProceedClick = () => {
        setIsLoading(true);
        onProceed();
    };

    return (
        <div className="bg-card border border-border/60 rounded-2xl p-8 text-center shadow-2xl animate-fade-in-down">
            <h2 className="text-4xl font-bold text-foreground mb-4">Välkommen till ByggPilot, {userName}!</h2>
            <p className="text-lg text-muted-foreground mb-6">
                För att komma igång, anslut ditt Google-konto. Detta skapar en säker mappstruktur på din Google Drive där alla dina projekt, offerter och dokument kommer att lagras.
            </p>

            {/* ========= FELMEDDELANDE (Använder nu temafärger) ========= */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive-foreground p-4 rounded-lg mb-6 flex items-center gap-3">
                    <XCircle className="h-5 w-5"/>
                    <div>
                        <p className="font-semibold">Kunde inte skapa mappstruktur</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Använder nu den standardiserade Button-komponenten */}
                <Button 
                    onClick={handleProceedClick} 
                    disabled={isLoading} 
                    size="lg" // Standardiserad storlek
                    className="w-full sm:w-auto shadow-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Ansluter...
                        </>
                    ) : (
                        <>
                            Anslut Google Konto & Skapa Struktur <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
                <Button onClick={onShowSecurity} variant="link" className="flex items-center justify-center gap-1 mx-auto">
                    <Info className="h-4 w-4" /> Varför behöver ni åtkomst?
                </Button>
                <p className="mt-4">eller</p>
                <Button onClick={onSkip} variant="link" className="mt-2">
                    hoppa över detta och fortsätt till dashboarden.
                </Button>
            </div>
        </div>
    );
}
