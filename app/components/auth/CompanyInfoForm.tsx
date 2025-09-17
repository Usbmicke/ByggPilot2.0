'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase/client';

interface IFormInput {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

const Input = ({ label, id, type = 'text', register, error, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
        </label>
        <input 
            type={type} 
            id={id} 
            {...register(id, { required: `${label} är obligatoriskt` })} 
            className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors disabled:opacity-50"
            disabled={disabled}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
    </div>
);

const CompanyInfoForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!user) {
        setServerError('Ingen användare är inloggad. Kan inte spara information.');
        return;
    }

    setLoading(true);
    setServerError(null);

    try {
      // Skapa en referens till dokumentet med användarens UID som ID
      const companyDocRef = doc(db, 'companies', user.uid);
      
      // Sätt dokumentdata. setDoc skapar dokumentet om det inte finns.
      await setDoc(companyDocRef, {
        ...data,
        userId: user.uid, // Spara en referens till användar-ID:t i dokumentet
        createdAt: new Date(), // Lägg till en tidsstämpel
      });

      // Omdirigera till dashboarden när allt är klart
      router.push('/dashboard');

    } catch (error) {
      console.error("Fel vid sparande av företagsinformation: ", error);
      setServerError('Ett fel uppstod när informationen skulle sparas. Försök igen.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-800/50 p-8 rounded-lg border border-gray-700">
        <Input label="Företagsnamn" id="companyName" register={register} error={errors.companyName} disabled={loading} />
        <Input label="Organisationsnummer" id="orgNumber" register={register} error={errors.orgNumber} disabled={loading} />
        <Input label="Adress" id="address" register={register} error={errors.address} disabled={loading} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Postnummer" id="postalCode" register={register} error={errors.postalCode} disabled={loading} />
            <Input label="Stad" id="city" register={register} error={errors.city} disabled={loading} />
        </div>

        <Input label="Telefonnummer" id="phone" type="tel" register={register} error={errors.phone} disabled={loading} />

        {serverError && <p className="text-red-400 text-sm text-center">{serverError}</p>}

        <div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {loading ? 'Sparar...' : 'Spara och fortsätt'}
            </button>
        </div>
    </form>
  );
};

export default CompanyInfoForm;
