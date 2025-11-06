'use client';

import React from 'react';
import OnboardingChat from '@/app/components/onboarding/OnboardingChat';

// Prop-definition för att kunna hantera slutförd onboarding
interface ZeroStateProps {
    onOnboardingComplete: () => void;
}

export default function ZeroState({ onOnboardingComplete }: ZeroStateProps) {

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
            <div className="w-full max-w-2xl h-full md:h-auto md:max-h-[70vh]">
                 {/* Byt ut det statiska innehållet mot den interaktiva OnboardingChat-komponenten */}
                <OnboardingChat onComplete={onOnboardingComplete} />
            </div>
        </div>
    );
}
