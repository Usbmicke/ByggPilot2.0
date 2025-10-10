'use client';
import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/app/actions/onboardingActions';
import { useSession } from 'next-auth/react';

// =================================================================================
// GULDSTANDARD: ONBOARDING STEG 4 - FÖRSTA PROJEKTET (DEMO)
// Sista steget som guidar användaren till dashboarden för att starta en guidad tur.
// =================================================================================

export default function Step4_FirstProject() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { update } = useSession();

    const handleStartTour = () => {
        startTransition(async () => {
            const result = await completeOnboarding();
            if (result.success) {
                // Uppdatera sessionen lokalt för att omedelbart reflektera ändringen
                await update({ onboardingComplete: true });
                // Omdirigera till dashboarden där den guidade turen kommer att starta
                router.push('/dashboard?tour=true');
            } else {
                // Hantera fel - kanske visa ett felmeddelande
                console.error(result.error);
            }
        });
    };

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Vänster sida (Motivation) */}
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-4">Dags att skapa magi.</h1>
                <p className="text-lg text-gray-300">
                    Allt är nu konfigurerat. Med ett klick tar vi dig till din nya dashboard och startar en guidad tur där vi tillsammans skapar ditt första, kompletta projekt - från offert till tidrapport - på under 60 sekunder. Låt oss börja!
                </p>
            </div>

            {/* Höger sida (Interaktion) */}
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center">
                 <h2 className="text-2xl font-bold text-white mb-4">Är du redo?</h2>
                <p className="text-gray-300 mb-6">Starta den guidade turen och se kraften i ByggPilot.</p>

                <button onClick={handleStartTour} disabled={isPending} className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                    {isPending ? 'Förbereder...' : 'Starta Guidad Tur (60s)'}
                </button>
            </div>
        </div>
    );
}
