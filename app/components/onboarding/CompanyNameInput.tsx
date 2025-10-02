
'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ArrowRightIcon, BuildingOffice2Icon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';

interface IFormInput {
  companyName: string;
}

interface CompanyNameInputProps {
  onSubmit: (companyName: string) => void;
  error: string | null;
  isPending: boolean;
}

const CompanyNameInput: React.FC<CompanyNameInputProps> = ({ onSubmit, error, isPending }) => {
  const { data: session } = useSession();
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>();

  const handleFormSubmit: SubmitHandler<IFormInput> = (data) => {
    onSubmit(data.companyName);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
            <BuildingOffice2Icon className="h-12 w-12 text-cyan-400" />
            <div>
                <h1 className="text-3xl font-bold text-white">Sist, vad heter ditt företag?</h1>
                <p className="text-gray-400">Hej {session?.user?.name?.split(' ')[0]}, detta blir det sista steget.</p>
            </div>
        </div>
      <p className="text-gray-300">
        Detta namn kommer att användas för att skapa din rotmapp i Google Drive, till exempel "ByggPilot - Mitt Företag AB".
      </p>
      <div>
        <label htmlFor="companyName" className="sr-only">
          Företagsnamn
        </label>
        <input
          type="text"
          id="companyName"
          {...register('companyName', { 
              required: 'Du måste ange ett företagsnamn.',
              minLength: { value: 2, message: 'Namnet måste vara minst 2 tecken.'}
          })}
          className="w-full bg-gray-800 border-2 border-gray-600 text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          placeholder="T.ex. Byggare Bob AB"
          disabled={isPending}
        />
        {errors.companyName && <p className="text-red-400 text-sm mt-2">{errors.companyName.message}</p>}
        {error && <p className="mt-2 text-sm text-red-400">Serverfel: {error}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
        >
          {isPending ? 'Sparar...' : 'Spara och fortsätt'}
          {!isPending && <ArrowRightIcon className='h-5 w-5' />}
        </button>
      </div>
    </form>
  );
};

export default CompanyNameInput;
