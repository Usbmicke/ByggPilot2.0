
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Folder, Loader2 } from "lucide-react";

// =================================================================================
// ONBOARDING STEP 2 V2.0 - REFAKTORERAD (GULDSTANDARD)
// BESKRIVNING: Denna version är uppgraderad för att använda shadcn/ui-komponenter
// (Card, Button). Den har en renare layout, bättre visuell hierarki och en mer
// förtroendeingivande design. Ikoner från lucide-react ersätter Heroicons för
// enhetlighet med resten av applikationen.
// =================================================================================

interface Step2StructureProps {
    onNext: () => void;
    isSubmitting: boolean;
    companyName: string;
}

const features = [
    { name: "En central plats för alla projekt", icon: Folder },
    { name: "Färdiga mappar för offerter & KMA", icon: Folder },
    { name: "Full äganderätt – all data lagras hos dig", icon: Folder },
];

export default function Step2_Structure({ onNext, isSubmitting, companyName }: Step2StructureProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center animate-fade-in">
            {/* Vänsterkolumn: Motivation & Information */}
            <div className="pt-4">
                <h3 className="text-3xl font-bold text-foreground mb-4">Släpp papperskaoset. För alltid.</h3>
                <p className="text-muted-foreground text-lg mb-6">
                    Vi skapar nu en smart mappstruktur direkt i din Google Drive. Detta blir ditt företags nya, digitala hjärta – organiserat och tillgängligt överallt.
                </p>
                <div className="space-y-3">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center text-muted-foreground">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span>{feature.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Högerkolumn: Interaktion & Bekräftelse */}
            <Card className="flex flex-col items-center justify-center text-center shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Din nya mappstruktur</CardTitle>
                    <CardDescription>En ny mapp skapas i din Google Drive.</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                    <div className="font-mono text-sm bg-secondary p-3 rounded-md my-4 text-secondary-foreground">
                        ByggPilot - {companyName}
                    </div>
                    
                    <Button
                        type="button"
                        onClick={() => onNext()}
                        disabled={isSubmitting}
                        className="w-full mt-4" 
                        size="lg"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Skapar magi...</>
                        ) : 'Skapa min smarta mappstruktur'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                        Detta kan ta upp till 30 sekunder. Du behöver bara göra det en gång.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
