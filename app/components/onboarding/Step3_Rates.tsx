
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// =================================================================================
// ONBOARDING STEP 3 V2.0 - REFAKTORERAD (GULDSTANDARD)
// BESKRIVNING: UI är helt ombyggt med shadcn/ui för en modern och konsekvent
// känsla. Använder Card-komponenter för att strukturera innehållet och ger
// tydligare instruktioner till användaren. Logiken är densamma, men presentationen
// är avsevärt förbättrad.
// =================================================================================

interface Step3RatesProps {
    onNext: (data: { defaultHourlyRate: number; defaultMaterialMarkup: number }) => void;
    isSubmitting: boolean;
}

export default function Step3_Rates({ onNext, isSubmitting }: Step3RatesProps) {
    const [hourlyRate, setHourlyRate] = useState('550');
    const [materialMarkup, setMaterialMarkup] = useState('15');

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        const rate = parseFloat(hourlyRate);
        const markup = parseFloat(materialMarkup);
        // Enkel validering för att säkerställa att vi skickar siffror
        if (!isNaN(rate) && !isNaN(markup)) {
            onNext({ defaultHourlyRate: rate, defaultMaterialMarkup: markup });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center animate-fade-in">
            {/* Vänsterkolumn: Motivation & Information */}
            <div className="pt-4">
                <h3 className="text-3xl font-bold text-foreground mb-4">Effektivisera din prissättning</h3>
                <p className="text-muted-foreground text-lg">
                    Ställ in dina standardpriser här så slipper du mata in dem för varje nytt projekt. Detta är din "receptbok" för lönsamhet.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                    Dessa värden används som standard när du skapar nya projekt, men du kan alltid justera dem från fall till fall.
                </p>
            </div>

            {/* Högerkolumn: Interaktion */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Din Prislista</CardTitle>
                    <CardDescription>Ange dina standardpriser nedan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleNext} className="flex flex-col gap-6">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="hourlyRate">Standardtimpris (ex. moms)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    id="hourlyRate"
                                    value={hourlyRate}
                                    onChange={(e) => setHourlyRate(e.target.value)}
                                    placeholder="550"
                                    required
                                    className="pr-14"
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground">kr/tim</span>
                            </div>
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="materialMarkup">Materialpåslag</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    id="materialMarkup"
                                    value={materialMarkup}
                                    onChange={(e) => setMaterialMarkup(e.target.value)}
                                    placeholder="15"
                                    required
                                    className="pr-12"
                                />
                                 <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground">%</span>
                            </div>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full mt-4" size="lg">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparar...</> : 'Nästa'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
