
'use client';

import React, { useState } from 'react';
import { ArrowRight, Info, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // <<< IMPORTERAR INPUT-KOMPONENT

interface Step_WelcomeProps {
    userName: string;
    companyName: string; // Ny prop
    setCompanyName: (name: string) => void; // Ny prop
    onProceed: () => void;
    onSkip: () => void;
    onShowSecurity: () => void;
    error: string | null;
}

export default function Step_Welcome({ 
    userName, 
    companyName, 
    setCompanyName, 
    onProceed, 
    onSkip, 
    onShowSecurity, 
    error 
}: Step_WelcomeProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleProceedClick = () => {
        if (!companyName.trim()) return; // Extra säkerhetskoll
        setIsLoading(true);
        onProceed();
    };

    return (
        <div className="bg-card border border-border/60 rounded-2xl p-8 text-center shadow-2xl animate-fade-in-down">
            <h2 className="text-4xl font-bold text-foreground mb-4">Välkommen till ByggPilot, {userName}!</h2>
            <p className="text-lg text-muted-foreground mb-6">
                Börja med att ange namnet på ditt företag. Detta namn kommer att användas för att skapa en rotmapp på din Google Drive för all din projektdata.
            </p>

            {/* ========= FÖRETAGSNAMN INPUT ========= */}
            <div className="max-w-md mx-auto mb-6">
                <Input 
                    type="text"
                    placeholder="Ange ditt företagsnamn..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="text-center text-lg p-6"
                />
            </div>

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
                <Button 
                    onClick={handleProceedClick} 
                    disabled={isLoading || !companyName.trim()} // Inaktiverad om inget namn
                    size="lg" 
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
