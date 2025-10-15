
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateCompanyProfile, createDriveStructure, updateDefaultRates, completeOnboarding } from '@/app/actions/onboardingActions';

// Main component that controls the flow
export default function OnboardingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.onboardingComplete) {
            router.replace('/dashboard');
        }
    }, [session, status, router]);

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const goToDashboard = () => router.push('/dashboard');
    const handleProfileSuccess = (name: string) => {
        setCompanyName(name);
        nextStep();
    };

    const steps = [
        { id: 1, Component: Step1_CompanyProfile, props: { onProfileSuccess: handleProfileSuccess } },
        { id: 2, Component: Step2_ProjectStructure, props: { nextStep, companyName } },
        { id: 3, Component: Step3_Rates, props: { nextStep } },
        { id: 4, Component: Step4_Finish, props: { goToDashboard } },
    ];

    if (status === 'loading' || (status === 'authenticated' && session?.user?.onboardingComplete)) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Laddar...</div>;
    }

    const ActiveStep = steps.find(s => s.id === currentStep)!.Component;
    const activeStepProps = steps.find(s => s.id === currentStep)!.props;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-400 mb-2">Steg {currentStep} av {steps.length}</p>
                    <div className="bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div></div>
                </div>
                <ActiveStep {...activeStepProps} />
                <div className="text-center mt-8"><button onClick={goToDashboard} className="text-gray-400 hover:text-white text-sm font-medium">Hoppa över och gå till Dashboard</button></div>
            </div>
        </div>
    );
}

// --- Felhanteringskomponent ---
function ErrorMessage({ message }: { message: string | null }) {
    if (!message) return null;
    return <p className="text-red-500 text-sm font-medium text-center mt-4">{message}</p>;
}

// --- Step 1: Company Profile ---
const companyProfileSchema = z.object({ companyName: z.string().min(2, "Företagsnamn är obligatoriskt."), orgnr: z.string().optional(), streetAddress: z.string().optional(), postalCode: z.string().optional(), city: z.string().optional() });
type CompanyProfileValues = z.infer<typeof companyProfileSchema>;

function Step1_CompanyProfile({ onProfileSuccess }: { onProfileSuccess: (companyName: string) => void }) {
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompanyProfileValues>({ resolver: zodResolver(companyProfileSchema) });

    const onSubmit = async (data: CompanyProfileValues) => {
        setError(null);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => { if (value) formData.append(key, value); });
        const result = await updateCompanyProfile(formData);
        if (result.success && result.companyName) {
            onProfileSuccess(result.companyName);
        } else {
            setError(result.error || 'Något gick fel.');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div><h2 className="text-3xl font-bold mb-4">Professionella dokument, automatiskt.</h2><p className="text-gray-300">Informationen här används för att automatiskt skapa snygga, korrekta offerter och fakturor. Fyll i en gång, spara tid för alltid.</p></div>
            <div className="bg-gray-800 p-8 rounded-lg">
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <div><label className="block text-sm font-medium text-gray-300">Företagsnamn</label><input {...register("companyName")} className="input w-full mt-1" />{errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-300">Organisationsnummer</label><input {...register("orgnr")} className="input w-full mt-1" /></div>
                    <div><label className="block text-sm font-medium text-gray-300">Adress</label><input {...register("streetAddress")} className="input w-full mt-1" /></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-300">Postnummer</label><input {...register("postalCode")} className="input w-full mt-1" /></div><div><label className="block text-sm font-medium text-gray-300">Stad</label><input {...register("city")} className="input w-full mt-1" /></div></div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full !mt-6">{isSubmitting ? 'Sparar...' : 'Nästa: Automatisera er projektstruktur'}</button>
                    <ErrorMessage message={error} />
                </form>
            </div>
        </div>
    );
}

// --- Step 2: Project Structure ---
function Step2_ProjectStructure({ nextStep, companyName }: { nextStep: () => void, companyName: string }) {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateStructure = async () => {
        setIsCreating(true);
        setError(null);
        const result = await createDriveStructure(companyName);
        if (result.success) {
            nextStep();
        } else {
            setError(result.error || 'Kunde inte skapa mappstrukturen.');
            setIsCreating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div><h2 className="text-3xl font-bold mb-4">Hitta allt, direkt. Alltid.</h2><p className="text-gray-300">ByggPilot skapar nu en central, smart mappstruktur i er Google Drive. Varje nytt projekt får automatiskt en egen komplett uppsättning mappar.</p></div>
            <div className="bg-gray-800 p-8 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-4">Ordning och reda, från start.</h3>
                <button onClick={handleCreateStructure} disabled={isCreating || !companyName} className="btn-primary w-full disabled:opacity-50">{isCreating ? 'Skapar struktur...' : 'Skapa min smarta mappstruktur'}</button>
                {!companyName && <p className="text-xs text-gray-400 mt-2">Du måste ange ett företagsnamn i föregående steg.</p>}
                <ErrorMessage message={error} />
            </div>
        </div>
    );
}

// --- Step 3: Rates ---
const ratesSchema = z.object({ hourlyRate: z.string().min(1, "Timpris är obligatoriskt."), materialMarkup: z.string().min(1, "Materialpåslag är obligatoriskt.") });
type RatesValues = z.infer<typeof ratesSchema>;

function Step3_Rates({ nextStep }: { nextStep: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RatesValues>({ resolver: zodResolver(ratesSchema) });

    const onSubmit = async (data: RatesValues) => {
        setError(null);
        const formData = new FormData();
        formData.append('hourlyRate', data.hourlyRate);
        formData.append('materialMarkup', data.materialMarkup);
        const result = await updateDefaultRates(formData);
        if (result.success) {
            nextStep();
        } else {
            setError(result.error || 'Något gick fel.');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div><h2 className="text-3xl font-bold mb-4">Kalkyler som stämmer. Varje gång.</h2><p className="text-gray-300">Genom att ange ert timpris och påslag säkerställer ni att varje snabbkalkyl är skräddarsydd för er verksamhet.</p></div>
            <div className="bg-gray-800 p-8 rounded-lg">
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-300">Standard timpris (Snickare)</label><input type="number" {...register("hourlyRate")} className="input w-full mt-1" defaultValue={550} />{errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate.message}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-300">Standard materialpåslag (%)</label><input type="number" {...register("materialMarkup")} className="input w-full mt-1" defaultValue={15} />{errors.materialMarkup && <p className="text-red-500 text-xs mt-1">{errors.materialMarkup.message}</p>}</div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Sparar...' : 'Nästa: Slutför'}</button>
                    <ErrorMessage message={error} />
                </form>
            </div>
        </div>
    );
}

// --- Step 4: Finish ---
function Step4_Finish({ goToDashboard }: { goToDashboard: () => void }) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFinish = async () => {
        setIsCompleting(true);
        setError(null);
        const result = await completeOnboarding();
        if (result.success) {
            goToDashboard();
        } else {
            setError(result.error || 'Kunde inte slutföra processen.');
            setIsCompleting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div><h2 className="text-3xl font-bold mb-4">Från noll till full kontroll.</h2><p className="text-gray-300">Ditt digitala kontor är nu konfigurerat. Alla dina projekt, kunder och dokument har en central plats.</p></div>
            <div className="bg-gray-800 p-8 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-4">Grattis! Ditt digitala kontor är redo.</h3>
                <p className="text-gray-300 mb-6">Klicka nedan för att gå direkt till din dashboard och börja arbeta.</p>
                <button onClick={handleFinish} disabled={isCompleting} className="btn-primary w-full">{isCompleting ? 'Omdirigerar...' : 'Gå till min Dashboard'}</button>
                <ErrorMessage message={error} />
            </div>
        </div>
    );
}
