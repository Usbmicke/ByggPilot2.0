
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { getCustomers } from '@/actions/customerActions'; // BORTTAGEN: Kommer ersättas med Genkit
// import { createProject } from '@/actions/projectActions'; // BORTTAGEN: Kommer ersättas med Genkit
import { useModal } from '@/contexts/ModalContext';
import { projectSchema, type ProjectFormData } from '@/lib/schemas/project';

const CreateProjectModal = () => {
  // TEMPORÄR FIX: Använder en tom array för kunder tills Genkit-flöde är på plats
  const [customers, setCustomers] = useState<{ id: string; name: string; }[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false); // Satt till false
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

  // TEMPORÄR FIX: Hämta kunder är bortkopplat. Logik kommer i Fas 2.
  useEffect(() => {
    // const fetchCustomers = async () => {
    //   try {
    //     // const customerList = await getCustomers(); // BORTTAGEN
    //     // setCustomers(customerList);
    //   } catch (error) {
    //     setServerError('Kunde inte ladda kundlistan.');
    //   } finally {
    //     setIsLoadingCustomers(false);
    //   }
    // };
    // fetchCustomers();
    console.log("Logik för att hämta kunder är temporärt bortkopplad.");
  }, []);

  // TEMPORÄR FIX: Formulärhantering är bortkopplad. Logik kommer i Fas 2.
  const onSubmit = (data: ProjectFormData) => {
    setServerError(null);
    console.log("Formulärdata som skulle skickas:", data);
    alert("Funktionaliteten för att skapa projekt är temporärt inaktiverad och kommer snart att återställas med den nya arkitekturen.");
    // startTransition(async () => {
    //   // const result = await createProject(data); // BORTTAGEN
    //   // if (result.status === 'success') {
    //   //   hideModal();
    //   // } else {
    //   //   setServerError(result.message || 'Ett okänt serverfel uppstod.');
    //   // }
    // });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Skapa Nytt Projekt</h2>

      <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg text-sm">
        <strong>Observera:</strong> Denna funktion är under ombyggnad. Du kan se formuläret, men det går inte att skapa projekt just nu.
      </div>

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
            <select {...field} id="customerId" className="w-full bg-gray-800 border-gray-600 rounded-md px-4 py-2 mt-1 text-white" disabled={true}>
              <option value="">{'Kundhämtning inaktiverad'}</option>
              {/* {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)} */}
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
            <button type="submit" disabled={true} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                {isPending ? 'Skapar...' : 'Skapa Projekt (Inaktiverad)'}
            </button>
      </div>
    </form>
  );
};

export default CreateProjectModal;
