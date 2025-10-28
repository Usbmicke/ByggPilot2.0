
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCustomers } from '@/app/actions/customerActions';
import { createProject } from '@/app/actions/projectActions';
import { useModal } from '@/app/context/ModalContext';
import { projectSchema, type ProjectFormData } from '@/app/lib/schemas/project';

const CreateProjectModal = () => {
  const [customers, setCustomers] = useState<{ id: string; name: string; }[]>([]);
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

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerList = await getCustomers();
        setCustomers(customerList);
      } catch (error) {
        setServerError('Kunde inte ladda kundlistan.');
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const onSubmit = (data: ProjectFormData) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createProject(data);
      if (result.status === 'success') {
        hideModal();
        // Kanske visa en notifikation här
      } else {
        setServerError(result.message || 'Ett okänt serverfel uppstod.');
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
          render={({ field }) => <input {...field} id="projectName" className="w-full bg-gray-800 border-gray-600 rounded-md px-4 py-2 mt-1 text-white" />} 
        />
        {errors.projectName && <p className="text-red-400 text-sm mt-1">{errors.projectName.message}</p>}
      </div>

      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-300">Kund</label>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <select {...field} id="customerId" className="w-full bg-gray-800 border-gray-600 rounded-md px-4 py-2 mt-1 text-white" disabled={isLoadingCustomers}>
              <option value="">{isLoadingCustomers ? 'Laddar kunder...' : 'Välj en kund'}</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )} 
        />
        {errors.customerId && <p className="text-red-400 text-sm mt-1">{errors.customerId.message}</p>}
      </div>
      
      {/* ... (resten av formuläret) ... */}
      
       <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={hideModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Avbryt
            </button>
            <button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                {isPending ? 'Skapar...' : 'Skapa Projekt'}
            </button>
      </div>
    </form>
  );
};

export default CreateProjectModal;
