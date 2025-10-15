
'use client';

import { PartyPopperIcon } from 'lucide-react';

// =================================================================================
// ONBOARDING STEP 4 V1.0 - GULDSTANDARD
// DESIGN: En bekräftelseskärm som ger användaren en känsla av att ha åstadkommit
// något. Den leder dem tydligt till nästa steg: att utforska applikationen.
// =================================================================================

interface Step4Props {
    onNext: () => void;
    isSubmitting: boolean;
}

export default function Step4_Finish({ onNext, isSubmitting }: Step4Props) {
    return (
        <div className="text-center py-8">
            <div className="flex justify-center items-center mb-6">
                <PartyPopperIcon className="h-16 w-16 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Allt är klart!</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                Din digitala arbetsplats är nu konfigurerad. Du är redo att skapa ditt första projekt och ta kontroll över din administration.
            </p>
            <button
                type="button"
                onClick={() => onNext()}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
            >
                {isSubmitting ? 'Omdirigerar...' : 'Gå till min instrumentpanel'}
            </button>
        </div>
    );
}
