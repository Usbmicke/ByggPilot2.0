'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateCompanyProfile, searchAddress, createDriveStructure, skipOnboarding } from '@/app/actions/onboardingActions';
import { useRouter } from 'next/navigation';

// =================================================================================
// GULDSTANDARD - Onboarding V5.2 (FULLSTÄNDIGT REPARERAD)
// REVIDERING: Återställer de saknade formulärfälten och säkerställer att all
// logik från V5.1 (inklusive skip-funktionen) är korrekt implementerad.
// =================================================================================

// Zod Schema (Nu komplett igen)
const companyProfileSchema = z.object({
    companyName: z.string().min(2, "Företagsnamn måste vara minst 2 tecken."),
    orgnr: z.string().optional(),
    phone: z.string().optional(),
    streetAddress: z.string().min(2, "Gatuadress är obligatorisk."),
    postalCode: z.string().min(5, "Postnummer måste vara 5 siffror.").max(5, "Postnummer får inte vara längre än 5 siffror."),
    city: z.string().min(2, "Ort är obligatorisk."),
});
type CompanyProfileValues = z.infer<typeof companyProfileSchema>;


// --- Ikoner (oförändrade) ---
const BriefcaseIcon = () => <svg className="w-16 h-16 mb-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const DriveIcon = () => <svg className="w-16 h-16 mb-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>;
const RocketIcon = () => <svg className="w-16 h-16 mb-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;


// --- Steg-komponenter (reparerade & robusta) ---

const CompanyProfileForm = ({ onSave }: { onSave: () => void }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<CompanyProfileValues>({ resolver: zodResolver(companyProfileSchema) });
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

    const handleAddressSearch = async (query: string) => {
        if (query.length < 3) {
            setAddressSuggestions([]);
            return;
        }
        const result = await searchAddress(query);
        if (result.success) {
            setAddressSuggestions(result.data.platsnamn || []);
        }
    };

    const onSubmit: SubmitHandler<CompanyProfileValues> = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            const value = data[key as keyof CompanyProfileValues];
            if (value) formData.append(key, value);
        });
        const result = await updateCompanyProfile(formData);
        if (result.success) {
            onSave();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input {...register("companyName")} placeholder="Företagsnamn" className="input-field" />
                <input {...register("orgnr")} placeholder="Organisationsnr" className="input-field" />
            </div>
            {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}

            <input {...register("streetAddress")} placeholder="Gatuadress" className="input-field" onChange={(e) => handleAddressSearch(e.target.value)} />
            {addressSuggestions.length > 0 && (
                <ul className="bg-gray-700 rounded-md p-2">
                    {addressSuggestions.map((suggestion, index) => (
                        <li key={index} className="cursor-pointer hover:bg-gray-600 p-2 rounded-md" onClick={() => {
                            setValue("streetAddress", suggestion.stavning);
                            setAddressSuggestions([]);
                        }}>
                            {suggestion.stavning}
                        </li>
                    ))}
                </ul>
            )}
            {errors.streetAddress && <p className="error-text">{errors.streetAddress.message}</p>}

            <div className="grid grid-cols-2 gap-4">
                <input {...register("postalCode")} placeholder="Postnummer" className="input-field" />
                <input {...register("city")} placeholder="Ort" className="input-field" />
            </div>
            {errors.postalCode && <p className="error-text">{errors.postalCode.message}</p>}
            {errors.city && <p className="error-text">{errors.city.message}</p>}

            <input {...register("phone")} placeholder="Telefonnummer" className="input-field" />
            
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Sparar...' : 'Spara och fortsätt'}</button>
        </form>
    );
};

const DriveStructureStep = ({ onComplete }: { onComplete: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateStructure = async () => {
        setLoading(true);
        setError('');
        const result = await createDriveStructure();
        if (result.success) {
            onComplete();
        } else {
            setError(result.error || 'Ett okänt fel inträffade. Vänligen försök igen.');
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Skapa ert Digitala Kontor</h3>
            <p className="text-gray-300 mb-8">Klicka på knappen nedan så bygger ByggPilot automatiskt en Guldstandard-mappstruktur i er Google Drive.</p>
            <button onClick={handleCreateStructure} disabled={loading} className="btn-primary w-full text-lg py-4">
                {loading ? 'Bygger ert digitala kontor...' : 'Ja, bygg min mappstruktur!'}
            </button>
            {error && <p className="error-text mt-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
        </motion.div>
    );
};

const AllSetStep = () => {
    const router = useRouter();
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
            <h3 className="text-3xl font-bold text-white mb-4">Allt är klart!</h3>
            <p className="text-gray-300 mb-8 text-lg">Välkommen till framtidens byggadministration. Er grund är lagd.</p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary w-full text-lg py-4">
                Ta mig till min Dashboard
            </button>
        </motion.div>
    );
};

const steps = [
    { id: 1, name: 'Företagsprofil', Component: CompanyProfileForm, leftContent: { Icon: BriefcaseIcon, title: 'Först, några snabba detaljer', description: 'Genom att förstå ert företag kan ByggPilot automatiskt fylla i dokument och anpassa arbetsflöden.' } },
    { id: 2, name: 'Projektstruktur', Component: DriveStructureStep, leftContent: { Icon: DriveIcon, title: 'Från Papperskaos till Digital Ordning', description: 'ByggPilot skapar en central, digital hubb för alla era projekt.' } },
    { id: 3, name: 'Klart!', Component: AllSetStep, leftContent: { Icon: RocketIcon, title: 'Ni är Redo för Start!', description: 'Er nya digitala grund är på plats. ByggPilot kommer nu att bli er andrepilot.' } },
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();

    const handleNext = () => {
        setCurrentStep(prev => (prev < steps.length ? prev + 1 : prev));
    };
    
    const handleSkip = async () => {
        const result = await skipOnboarding();
        if (result.success) {
            router.push('/dashboard');
        } else {
            alert("Kunde inte hoppa över. Försök igen.");
        }
    };

    const activeStep = steps.find(s => s.id === currentStep) || steps[0];
    const { Component, leftContent } = activeStep;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
             <button onClick={handleSkip} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors duration-200">Hoppa över</button>
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <motion.div key={currentStep} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="hidden md:flex flex-col items-center text-center p-8">
                    <leftContent.Icon />
                    <h1 className="text-4xl font-bold mb-4 leading-tight">{leftContent.title}</h1>
                    <p className="text-lg text-gray-300 max-w-md">{leftContent.description}</p>
                </motion.div>
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
                        <div className="mb-8">
                            <p className="text-sm font-medium text-gray-400 mb-2">Steg {currentStep} av {steps.length}</p>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div className="bg-blue-500 h-2 rounded-full" initial={{ width: '0%' }} animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} transition={{ duration: 0.5, ease: "linear" }} />
                            </div>
                        </div>
                        <AnimatePresence mode="wait">
                             <Component key={currentStep} onSave={handleNext} onComplete={handleNext} />
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
