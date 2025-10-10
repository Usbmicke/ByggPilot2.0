'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateCompanyProfile } from '@/app/actions/onboardingActions';

// =================================================================================
// GULDSTANDARD - CompanyProfileForm V2.2 (FINAL)
// ARKITEKTUR: Anropet till Lantmäteriet går nu via vår egen proxy-route (`/api/address-search`)
// för att permanent lösa CORS-problematiken. Detta är den slutgiltiga och korrekta implementationen.
// =================================================================================

const profileSchema = z.object({
    companyName: z.string().min(2, "Företagsnamn måste vara minst 2 tecken"),
    orgnr: z.string().regex(/^(\d{6}-\d{4}|\d{10})$/, "Giltigt organisationsnummer krävs (10 siffror eller 6-4)"),
    phone: z.string().min(8, "Ange ett giltigt telefonnummer"),
    streetAddress: z.string().min(2, "Ange en gatuadress"),
    postalCode: z.string().regex(/^[0-9]{5}$/, "Ange ett giltigt postnummer (5 siffror)"),
    city: z.string().min(2, "Ange en ort"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type AddressSuggestion = {
    label: string;
    streetAddress: string;
    postalCode: string;
    city: string;
};

export function CompanyProfileForm({ onSave }: { onSave: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [addressQuery, setAddressQuery] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, setValue, formState: { errors, isValid } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        mode: 'onChange',
        defaultValues: { 
            companyName: '',
            orgnr: '',
            phone: '',
            streetAddress: '',
            postalCode: '',
            city: ''
        }
    });

    // **FIX: Anropet går nu till vår interna proxy-route**
    const handleAddressSearch = async (query: string) => {
        setAddressQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            // Anropar vår egen API-proxy istället för direkt till Lantmäteriet
            const response = await fetch(`/api/address-search?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            const mappedSuggestions = (data.platsnamn || []).map((p: any) => ({
                label: p.stavning,
                streetAddress: p.adressplats?.gatunamn || '',
                postalCode: p.adressplats?.postnummer || '',
                city: p.adressplats?.postort || ''
            })).filter((s: AddressSuggestion) => s.label && s.streetAddress && s.postalCode && s.city);
            setSuggestions(mappedSuggestions);
        } catch (error) {
            console.error("Fel vid hämtning av adressförslag via proxy:", error);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: AddressSuggestion) => {
        setValue('streetAddress', suggestion.streetAddress, { shouldValidate: true });
        setValue('postalCode', suggestion.postalCode.replace(/\s/g, ''), { shouldValidate: true });
        setValue('city', suggestion.city, { shouldValidate: true });
        setSuggestions([]);
        setAddressQuery(`${suggestion.streetAddress}, ${suggestion.postalCode} ${suggestion.city}`);
    };

    const onSubmit = (data: ProfileFormValues) => {
        setError(null);
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const result = await updateCompanyProfile(formData);
            if (result.success) {
                onSave();
            } else {
                setError(result.error || "Ett okänt fel uppstod.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-white">Företagsprofil</h2>
            <p className="text-gray-400">Berätta om ditt företag. Denna information kommer att användas för att anpassa din upplevelse.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller name="companyName" control={control} render={({ field }) => <input {...field} placeholder="Företagsnamn" className="input-field" />} />
                <Controller name="orgnr" control={control} render={({ field }) => <input {...field} placeholder="Organisationsnummer" className="input-field" />} />
            </div>
            {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
            {errors.orgnr && <p className="error-text">{errors.orgnr.message}</p>}

            <div className="relative">
                <input 
                    type="text"
                    placeholder="Sök adress... (t.ex. Sveavägen 46, Stockholm)"
                    value={addressQuery}
                    onChange={(e) => handleAddressSearch(e.target.value)}
                    className="input-field"
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 shadow-lg">
                        {suggestions.map((s, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(s)} className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-white">
                                {s.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Controller name="streetAddress" control={control} render={({ field }) => <input {...field} placeholder="Gatuadress" className="input-field" />} />
                 <Controller name="postalCode" control={control} render={({ field }) => <input {...field} placeholder="Postnummer" className="input-field" />} />
                 <Controller name="city" control={control} render={({ field }) => <input {...field} placeholder="Ort" className="input-field" />} />
            </div>
            {errors.streetAddress && <p className="error-text">{errors.streetAddress.message}</p>}
            {errors.postalCode && <p className="error-text">{errors.postalCode.message}</p>}
            {errors.city && <p className="error-text">{errors.city.message}</p>}

             <Controller name="phone" control={control} render={({ field }) => <input {...field} placeholder="Telefonnummer" className="input-field" />} />
             {errors.phone && <p className="error-text">{errors.phone.message}</p>}

            {error && <p className="error-text bg-red-900 p-3 rounded-md">{error}</p>}

            <button type="submit" disabled={!isValid || isPending} className="btn-primary w-full">
                {isPending ? 'Sparar...' : 'Spara och fortsätt'}
            </button>
        </form>
    );
}
