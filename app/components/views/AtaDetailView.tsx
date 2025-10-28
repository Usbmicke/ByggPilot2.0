'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/app/types/index'; // Korrigerad import
import { Ata } from '@/app/types/index'; // Korrigerad import
import { ArrowUturnLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AtaDetailViewProps {
  project: Project;
  initialAta: Ata;
}

export default function AtaDetailView({ project, initialAta }: AtaDetailViewProps) {
  const router = useRouter();
  const [ata, setAta] = useState<Ata>(initialAta);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAta(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/projects/${project.id}/atas/${ata.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ata),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Något gick fel vid uppdateringen.');
      }
      
      setSuccess(true);
      // Göm success-meddelandet efter 3 sekunder
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push(`/projects/${project.id}?view=ata`)} 
          className="p-2 mr-4 rounded-full hover:bg-gray-700/50 transition-colors"
        >
          <ArrowUturnLeftIcon className="w-6 h-6 text-gray-300"/>
        </button>
        <h2 className="text-2xl font-bold text-white truncate">Redigera ÄTA</h2>
      </div>

      <div className="space-y-6 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        {/* Beskrivning */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Beskrivning</label>
          <textarea 
            id="description" 
            name="description"
            rows={4}
            value={ata.description || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {/* Pris */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Pris (SEK, inkl. moms)</label>
          <input 
            type="number"
            id="price"
            name="price"
            value={ata.price || ''}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select 
            id="status" 
            name="status"
            value={ata.status}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="pending">Väntar</option>
            <option value="approved">Godkänd</option>
            <option value="rejected">Nekad</option>
          </select>
        </div>

        <div className="flex justify-end items-center gap-4 pt-4">
            {/* Feedback-meddelanden */}
            {error && (
                <div className="flex items-center gap-2 text-red-400">
                    <ExclamationTriangleIcon className="h-5 w-5"/> 
                    <span>{error}</span>
                </div>
            )}
            {success && (
                 <div className="flex items-center gap-2 text-green-400 animate-pulse">
                    <CheckCircleIcon className="h-5 w-5"/> 
                    <span>Sparad!</span>
                </div>
            )}

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-cyan-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Sparar...' : 'Spara'}
          </button>
        </div>
      </div>
    </div>
  );
}
