
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler, UseFormRegister, FieldError } from 'react-hook-form';
import toast from 'react-hot-toast';

// SANERING (Fas 0): All next-auth-relaterad kod är borttagen eller inaktiverad.
// Ny autentiseringslogik med Firebase Auth implementeras i Fas 2.

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
  const [isLoading, setIsLoading] = useState(false);

  // SANERING: onSubmit-logiken är tillfälligt ersatt för att undvika beroende av next-auth.
  // Den fullständiga logiken återställs med Firebase-användare i Fas 2.2.
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsLoading(true);
    toast.error('Funktionen är tillfälligt avstängd under migrering till nytt autentiseringssystem.');
    console.log('Formulärdata (skickas ej):', data);
    setIsLoading(false);
    
    // Den ursprungliga logiken som använde `session` är borttagen här.
    // Den kommer att anropa Genkit-flödet med en Firebase-användares UID.
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
                // SANERING: Beroendet av `session` för `disabled`-attributet är borttaget.
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Sparar...' : 'Slutför registrering'}
            </button>
        </div>
    </form>
  );
};

export default CompanyInfoForm;
