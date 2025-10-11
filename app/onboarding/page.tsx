
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateCompanyProfile, createDriveStructure, skipOnboarding } from '@/app/actions/onboardingActions';
import { useRouter } from 'next/navigation';

// =================================================================================
// GULDSTANDARD - Onboarding V12.0 (FULLSTÄNDIG ÅTERSTÄLLNING & KORREKT NAVIGERING)
// REVIDERING:
// 1. Återställer den kompletta 3-stegslogiken enligt checklistan.
// 2. API-anrop för adress sker ENDAST vid klick på "Hämta"-knapp.
// 3. Navigering i sista steget använder window.location.href för att tvinga
//    en session-omladdning och garantera korrekt övergång till dashboard.
// =================================================================================

const companyProfileSchema = z.object({
    companyName: z.string().min(2, "Företagsnamn måste vara minst 2 tecken."),
    orgnr: z.string().optional(),
    phone: z.string().optional(),
    streetAddress: z.string().min(2, "Gatuadress är obligatorisk."),
    postalCode: z.string().min(5, "Postnummer måste vara 5 siffror.").max(6, "Postnummer får inte vara längre än 6 siffror."),
    city: z.string().min(2, "Ort är obligatorisk."),
});
type CompanyProfileValues = z.infer<typeof companyProfileSchema>;

// --- Ikoner ---
const BriefcaseIcon = () => <svg className="w-16 h-16 mb-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
const DriveIcon = () => <svg className="w-16 h-16 mb-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>;
const RocketIcon = () => <svg className="w-16 h-16 mb-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;


// --- Steg 1: Företagsprofil ---
const CompanyProfileForm = ({ onSave }: { onSave: () => void }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, getValues } = useForm<CompanyProfileValues>({ resolver: zodResolver(companyProfileSchema) });
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    
    const fetchCompanyData = useCallback(async () => {
        const orgnrValue = getValues('orgnr');
        if (!orgnrValue || (orgnrValue.replace(/-/g, '').length < 10)) {
            alert("Ange ett giltigt organisationsnummer.");
            return;
        }
        setIsFetchingAddress(true);
        try {
            const response = await fetch(`/api/company-lookup/${orgnrValue}`);
            if (!response.ok) throw new Error('Kunde inte hämta företagsinformation');
            const data = await response.json();
            setValue('companyName', data.companyName, { shouldValidate: true });
            setValue('streetAddress', data.address.street, { shouldValidate: true });
            setValue('postalCode', data.address.zipCode, { shouldValidate: true });
            setValue('city', data.address.city, { shouldValidate: true });
        } catch (error) {
            console.error("Fel vid hämtning av företagsdata:", error);
            alert("Kunde inte hitta företaget. Kontrollera organisationsnumret eller fyll i uppgifterna manuellt.");
        } finally {
            setIsFetchingAddress(false);
        }
    }, [getValues, setValue]);

    const onSubmit: SubmitHandler<CompanyProfileValues> = async (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) formData.append(key, String(value));
        });
        const result = await updateCompanyProfile(formData);
        if (result.success) onSave();
        else alert("Kunde inte spara profilen. Försök igen.");
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">Företagsnamn</label>
                <input id="companyName" {...register('companyName')} className="input-field w-full" />
                {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
            </div>
             <div className="relative">
                <label htmlFor="orgnr" className="block text-sm font-medium text-gray-300 mb-1">Organisationsnummer (valfritt)</label>
                <input id="orgnr" {...register('orgnr')} className="input-field w-full pr-20" />
                <button type="button" onClick={fetchCompanyData} disabled={isFetchingAddress} className="absolute right-2 top-[29px] text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md disabled:opacity-50">
                    {isFetchingAddress ? 'Hämtar...' : 'Hämta'}
                </button>
            </div>
             <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Telefon (valfritt)</label>
                <input id="phone" type="tel" {...register('phone')} className="input-field w-full" />
            </div>
             <div>
                <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-300 mb-1">Gatuadress</label>
                <input id="streetAddress" {...register('streetAddress')} className="input-field w-full" />
                {errors.streetAddress && <p className="error-text">{errors.streetAddress.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">Postnr</label>
                    <input id="postalCode" {...register('postalCode')} className="input-field w-full" />
                    {errors.postalCode && <p className="error-text">{errors.postalCode.message}</p>}
                </div>
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">Ort</label>
                    <input id="city" {...register('city')} className="input-field w-full" />
                    {errors.city && <p className="error-text">{errors.city.message}</p>}
                </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Sparar...' : 'Spara och fortsätt'}</button>
        </form>
    );
};

// --- Steg 2: Digital Struktur ---
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
            setError(result.error || 'Ett okänt fel inträffade.');
            setLoading(false);
        }
    };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Skapa ert Digitala Kontor</h3>
            <p className="text-gray-300 mb-8">Klicka på knappen så bygger ByggPilot er ISO-inspirerade mappstruktur i Google Drive. Detta kan ta upp till en minut.</p>
            <button onClick={handleCreateStructure} disabled={loading} className="btn-primary w-full text-lg py-4">
                {loading ? 'Bygger ert digitala kontor...' : 'Ja, bygg min mappstruktur!'}
            </button>
            {error && <p className="error-text mt-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
        </motion.div>
    );
};

// --- Steg 3: Färdigt! ---
const AllSetStep = () => {
    const handleRedirect = () => {
        // Använder window.location.href för att tvinga en fullständig sidomladdning.
        // Detta säkerställer att NextAuth-sessionen uppdateras och att servern
        // känner igen att onboardingen är slutförd.
        window.location.href = '/dashboard?tour=true';
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full space-y-4">
            <h3 className="text-3xl font-bold text-white mb-2">Allt är klart!</h3>
            <p className="text-gray-300 mb-6 text-lg">Er digitala grund är lagd. Nu är det dags att börja arbeta smartare.</p>
            <button onClick={handleRedirect} className="btn-primary w-full text-lg py-3">Ta mig till min Dashboard</button>
        </motion.div>
    );
};

// --- Huvudkomponent och State-hantering ---
export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();

    const handleNext = () => setCurrentStep(prev => prev + 1);
    
    const handleSkip = async () => {
        const result = await skipOnboarding();
        if (result.success) {
             // Använder också window.location.href här för konsistens och robusthet
            window.location.href = '/dashboard';
        }
        else alert("Kunde inte hoppa över. Försök igen.");
    };

    const steps = [
        { id: 1, name: 'Företagsprofil', icon: BriefcaseIcon, title: 'Välkommen till ByggPilot', description: 'Börja med att fylla i grundläggande information om ditt företag. Detta hjälper oss att skräddarsy din upplevelse.', Component: () => <CompanyProfileForm onSave={handleNext} /> },
        { id: 2, name: 'Digital Struktur', icon: DriveIcon, title: 'Skapa ert Digitala Kontor', description: 'Vi sätter upp en ISO-inspirerad mappstruktur i er Google Drive.', Component: () => <DriveStructureStep onComplete={handleNext} /> },
        { id: 3, name: 'Färdigt!', icon: RocketIcon, title: 'Allt är klart!', description: 'Er digitala grund är lagd. Dags att börja arbeta smartare.', Component: AllSetStep }
    ];

    const activeStepInfo = steps.find(s => s.id === currentStep) || steps[0];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
            <button onClick={handleSkip} className="absolute top-6 right-6 text-gray-400 hover:text-white">Hoppa över</button>
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                
                <div className="text-center md:text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center md:items-start"
                        >
                            <activeStepInfo.icon />
                            <h1 className="text-4xl font-bold text-white mb-4">{activeStepInfo.title}</h1>
                            <p className="text-gray-300 text-lg">{activeStepInfo.description}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="w-full max-w-md mx-auto">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
                         <div className="mb-8">
                            <p className="text-sm font-medium text-gray-400 mb-2">Steg {currentStep} av {steps.length}</p>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(((currentStep - 1) / (steps.length -1))) * 100}%` }} />
                            </div>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div key={currentStep}>
                                <activeStepInfo.Component />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
