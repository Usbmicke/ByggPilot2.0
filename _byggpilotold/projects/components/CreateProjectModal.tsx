
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModal } from '@/contexts/ModalContext';
import { projectSchema, type ProjectFormData } from 'lib/schemas';
import toast from 'react-hot-toast';

// Typdefinition för en kund i dropdown-listan
interface Customer {
  id: string;
  name: string;
}

const CreateProjectModal = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { hideModal } = useModal();

  const { control, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
        projectName: '',
        customerId: '',
        projectType: 'ROT',
        description: ''
    }
  });

  // Hämta kunder när komponenten mountas
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/flow/customerFlow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get' })
        });
        if (!response.ok) throw new Error('Kunde inte hämta kunder.');
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        toast.error('Kunde inte ladda kundlistan.');
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const onSubmit = (data: ProjectFormData) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/flow/projectFlow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', payload: data })
        });

        const result = await response.json();
        if (!response.ok || !result.id) {
          throw new Error(result.message || 'Kunde inte skapa projektet.');
        }

        toast.success('Projekt skapat!');
        hideModal();
        // Här kan man också lägga till logik för att uppdatera projektlistan i bakgrunden.

      } catch (e: any) {
        setServerError(e.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Skapa Nytt Projekt</h2>

      {serverError && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{serverError}</div>}

      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-300">Projektnamn</label>
        <Controller
          name="projectName"
          control={control}
          render={({ field }) => <input {...field} id="projectName" className="w-full bg-gray-800 border-gray-600 rounded-md px-4 py-2 mt-1 text-white" disabled={isPending}/>} 
        />
        {errors.projectName && <p className="text-red-400 text-sm mt-1">{errors.projectName.message}</p>}
      </div>

      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-300">Kund</label>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <select {...field} id="customerId" className="w-full bg-gray-800 border-gray-600 rounded-md px-4 py-2 mt-1 text-white" disabled={isLoadingCustomers || isPending}>
              <option value="">{isLoadingCustomers ? 'Laddar kunder...' : 'Välj en kund'}</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )} 
        />
        {errors.customerId && <p className="text-red-400 text-sm mt-1">{errors.customerId.message}</p>}
      </div>
      
       <div>
        <label htmlFor="projectType" className="block text-sm font-medium text-gray-300">Projekttyp</label>
        <Controller
          name="projectType"
          control={control}
          render={({ field }) => (
            <select {...field} id="projectType" className="w-full bg-gray-800 border-gray-600 rounded-md px-4 py-2 mt-1 text-white" disabled={isPending}>
              <option value="ROT">ROT</option>
              <option value="RUT">RUT</option>
              <option value="Annat">Annat</option>
            </select>
          )} 
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Beskrivning (valfritt)</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <textarea {...field} id="description" rows={3} className="w-full bg-gray-800 border-gray-600 rounded-md px-4 py-2 mt-1 text-white" disabled={isPending}/>} 
        />
      </div>
      
       <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={hideModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Avbryt
            </button>
            <button type="submit" disabled={isPending || isLoadingCustomers} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                {isPending ? 'Skapar...' : 'Skapa Projekt'}
            </button>
      </div>
    </form>
  );
};

export default CreateProjectModal;
