
'use client';

import { useState } from 'react';
import type { User } from 'next-auth';
import { completeOnboarding } from '@/app/actions/onboardingActions';
import { useRouter } from 'next/navigation';

// Importera steg-komponenterna (kommer skapas härnäst)
import Step1_Profile from './Step1_Profile';
import Step2_Structure from './Step2_Structure';
import Step3_Rates from './Step3_Rates';
import Step4_Finish from './Step4_Finish';
import ProgressBar from './ProgressBar';

// =================================================================================
// ONBOARDING FLOW V1.0 - GULDSTANDARD
// ARKITEKTUR: En state machine-liknande komponent som hanterar det aktiva steget,
// samlar in data från barn-komponenter och agerar som den enda punkten för
// kommunikation med servern (via Server Actions). Detta isolerar state och
// gör barn-komponenterna "dumma" och återanvändbara.
// =================================================================================

type FormData = {
    companyName?: string;
    orgNumber?: string;
    address?: string;
    defaultHourlyRate?: number;
    defaultMaterialMarkup?: number;
};

export default function OnboardingFlow({ user }: { user: User }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleNext = async (stepData: Partial<FormData> = {}) => {
        setError(null);
        setIsSubmitting(true);

        const updatedFormData = { ...formData, ...stepData };
        setFormData(updatedFormData);

        try {
            let result;
            if (currentStep === 1) {
                result = await completeOnboarding(1, { companyName: updatedFormData.companyName, orgNumber: updatedFormData.orgNumber, address: updatedFormData.address });
            } else if (currentStep === 2) {
                result = await completeOnboarding(2, {});
            } else if (currentStep === 3) {
                result = await completeOnboarding(3, { defaultHourlyRate: updatedFormData.defaultHourlyRate, defaultMaterialMarkup: updatedFormData.defaultMaterialMarkup });
            } else if (currentStep === 4) {
                result = await completeOnboarding(4, {});
                if (result.success) {
                    router.push('/dashboard'); // Omdirigera till dashboard efter sista steget
                    return;
                }
            }

            if (result?.success) {
                setCurrentStep(prev => prev + 1);
            } else {
                throw new Error(result?.error || 'Ett okänt fel inträffade.');
            }
        } catch (e: any) {
            setError(e.message || 'Kunde inte slutföra steget. Vänligen försök igen.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1_Profile onNext={handleNext} isSubmitting={isSubmitting} />;
            case 2:
                return <Step2_Structure onNext={handleNext} isSubmitting={isSubmitting} companyName={formData.companyName || user.name || ''} />;
            case 3:
                 return <Step3_Rates onNext={handleNext} isSubmitting={isSubmitting} />;
            case 4:
                 return <Step4_Finish onNext={handleNext} isSubmitting={isSubmitting} />;
            default:
                return <div>Ogiltigt steg</div>;
        }
    };

    return (
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-8">
                <ProgressBar currentStep={currentStep} totalSteps={4} />
                <div className="mt-8">
                    {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6" role="alert">{error}</div>}
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}
