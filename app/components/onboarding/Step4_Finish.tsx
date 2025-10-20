
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, PartyPopper } from "lucide-react";
import { Loader2 } from "lucide-react";

// =================================================================================
// ONBOARDING STEP 4 V2.0 - REFAKTORERAD (GULDSTANDARD)
// BESKRIVNING: Sista steget har fått en visuell uppgradering med Card-komponenter
// för att rama in budskapet. Designen är renare och mer firande för att ge
// användaren en positiv känsla av slutförande.
// =================================================================================

interface Step4FinishProps {
    onNext: () => void;
    isSubmitting: boolean;
}

export default function Step4_Finish({ onNext, isSubmitting }: Step4FinishProps) {
    return (
        <div className="flex justify-center items-center py-8 animate-fade-in">
            <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                        <PartyPopper className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl">Allt är klart!</CardTitle>
                    <CardDescription className="text-lg">
                        Din digitala arbetsplats är nu konfigurerad.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-8">
                        Du är redo att skapa ditt första projekt, bjuda in en kund och ta full kontroll över din administration. Välkommen till ett smartare sätt att arbeta.
                    </p>
                    <Button 
                        onClick={() => onNext()}
                        disabled={isSubmitting}
                        size="lg"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Omdirigerar...</>
                        ) : 'Gå till min instrumentpanel'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
