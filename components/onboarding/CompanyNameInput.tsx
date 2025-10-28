
'use client';

import React, { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

interface CompanyNameInputProps {
  onSubmit: (companyName: string) => void;
  error: string | null;
  isPending: boolean;
}

export default function CompanyNameInput({ onSubmit, error, isPending }: CompanyNameInputProps) {
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      onSubmit(companyName.trim());
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold text-white">Först, vad heter ditt företag?</h1>
      <p className="mt-4 text-lg text-gray-300">
        Detta namn kommer att användas för att skapa din mappstruktur och anpassa din upplevelse.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="companyName" className="sr-only">Företagsnamn</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            placeholder="t.ex. Bygg AB"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isPending || !companyName.trim()}
          className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
        >
          {isPending ? 'Sparar...' : 'Fortsätt'}
          {!isPending && <ArrowRightIcon className='h-5 w-5'/>}
        </button>
      </form>
    </div>
  );
}
