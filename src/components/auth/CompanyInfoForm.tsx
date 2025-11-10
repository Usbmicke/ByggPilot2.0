
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, UseFormRegister, FieldError } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

// Gammal action-import borttagen. Anrop sker nu via API.

interface IFormInput {
  companyName: string;
  orgNumber: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

interface InputProps {
    label: string;
    id: keyof IFormInput;
    type?: string;
    register: UseFormRegister<IFormInput>;
    error: FieldError | undefined;
    disabled: boolean;
}

const Input: React.FC<InputProps> = ({ label, id, type = 'text', register, error, disabled }) => (
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
  const { data: session, update } = useSession(); 
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!session?.user?.id) {
        toast.error('Ingen användarsession hittades. Prova att logga in igen.');
        return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/flow/userFlow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateCompanyInfo',
          userId: session.user.id,
          data: data
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ett okänt fel uppstod vid anrop till Genkit-flödet.');
      }

      toast.success('Information sparad! Omdirigerar...');
      
      // Uppdatera NextAuth-sessionen för att reflektera de nya uppgifterna.
      await update(); 

      // Tvinga en omladdning för att säkerställa att all server-side state är synkad.
      window.location.href = '/dashboard';

    } catch (error: any) {
      toast.error(error.message || 'Ett okänt fel uppstod.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-800/50 p-8 rounded-lg border border-gray-700">
        <Input label="Företagsnamn" id="companyName" register={register} error={errors.companyName} disabled={isLoading} />
        <Input label="Organisationsnummer" id="orgNumber" register={register} error={errors.orgNumber} disabled={isLoading} />
        <Input label="Adress" id="address" register={register} error={errors.address} disabled={isLoading} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Postnummer" id="postalCode" register={register} error={errors.postalCode} disabled={isLoading} />
            <Input label="Stad" id="city" register={register} error={errors.city} disabled={isLoading} />
        </div>

        <Input label="Telefonnummer" id="phone" type="tel" register={register} error={errors.phone} disabled={isLoading} />

        <div>
            <button 
                type="submit" 
                disabled={isLoading || !session}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Sparar...' : 'Slutför registrering'}
            </button>
        </div>
    </form>
  );
};

export default CompanyInfoForm;
