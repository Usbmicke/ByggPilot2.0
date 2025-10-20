
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// =================================================================================
// ONBOARDING STEP 1 V2.0 - REFAKTORERAD (GULDSTANDARD)
// BESKRIVNING: Denna version är anpassad för att fungera som ett "dumt" steg inuti
// OnboardingFlow. Den tar emot `onNext` som en prop och skickar tillbaka sin data.
// UI är uppgraderat till shadcn/ui för ett konsekvent och modernt utseende.
// =================================================================================

interface Step1ProfileProps {
    onNext: (data: { companyName: string; orgNumber?: string; address?: string }) => void;
    isSubmitting: boolean;
}

export default function Step1_Profile({ onNext, isSubmitting }: Step1ProfileProps) {
    const [formData, setFormData] = useState({
        companyName: '',
        orgNumber: '',
        address: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.companyName.trim()) {
            onNext(formData);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center animate-fade-in">
            {/* Vänsterkolumn: Motivering */}
            <div className="pt-4">
                <h3 className="text-3xl font-bold text-foreground mb-4">Berätta om ditt företag</h3>
                <p className="text-muted-foreground text-lg">
                    Allt börjar med ditt företagsnamn. Detta namn kommer att användas för att skapa din personliga mappstruktur i Google Drive och kommer att synas på dina framtida offerter och fakturor.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                    Du kan lägga till organisationsnummer och adress senare om du vill.
                </p>
            </div>

            {/* Högerkolumn: Interaktion */}
            <div className="bg-card border p-8 rounded-xl shadow-lg">
                <form onSubmit={handleNext} className="flex flex-col gap-6">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="companyName">Företagsnamn *</Label>
                        <Input 
                            type="text" 
                            name="companyName" 
                            id="companyName" 
                            value={formData.companyName} 
                            onChange={handleInputChange} 
                            placeholder="Din Byggfirma AB"
                            required 
                        />
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="orgNumber">Organisationsnummer (frivilligt)</Label>
                        <Input 
                            type="text" 
                            name="orgNumber" 
                            id="orgNumber" 
                            value={formData.orgNumber} 
                            onChange={handleInputChange} 
                            placeholder="556123-4567"
                        />
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="address">Adress (frivilligt)</Label>
                        <Input 
                            type="text" 
                            name="address" 
                            id="address" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            placeholder="Storgatan 1, 123 45 Stockholm"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !formData.companyName.trim()} 
                        className="mt-4 w-full" 
                        size="lg"
                    >
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sparar...</> : 'Nästa'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
