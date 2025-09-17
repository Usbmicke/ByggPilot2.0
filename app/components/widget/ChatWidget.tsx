'use client';

import React, { useState } from 'react';
import OnboardingChat from '@/app/components/onboarding/OnboardingChat';
import { UserProfile } from '@/app/dashboard/layout';

interface ChatWidgetProps {
    userProfile: UserProfile;
}

const ChatWidget = ({ userProfile }: ChatWidgetProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            {/* Själva chatt-fönstret, villkorligt renderat */}
            {isOpen && (
                <div className="fixed bottom-24 right-8 w-full max-w-md bg-gray-800 rounded-lg shadow-2xl z-50">
                    {/* Vi kan återanvända OnboardingChat men med en prop som indikerar att det är ett "normalt" läge */}
                    <OnboardingChat userProfile={userProfile} isWidgetMode={true} />
                </div>
            )}

            {/* Ikonen/knappen för att öppna chatten */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 bg-cyan-600 hover:bg-cyan-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-transform transform hover:scale-110"
                aria-label={isOpen ? "Stäng chatt" : "Öppna chatt"}
            >
                {/* Enkel ikon för att växla mellan öppen/stängd */}
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {isOpen 
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> 
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    }
                </svg>
            </button>
        </div>
    );
};

export default ChatWidget;
