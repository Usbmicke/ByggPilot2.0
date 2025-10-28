
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Invoice, InvoiceLine } from '@/app/types';
import { createInvoice } from '@/app/actions/invoiceActions'; // Server Action
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

interface CreateInvoiceViewProps {
  projects: Project[];
}

const CreateInvoiceView: React.FC<CreateInvoiceViewProps> = ({ projects }) => {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [invoiceLines, setInvoiceLines] = useState<Partial<InvoiceLine>[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLine = () => {
    setInvoiceLines([...invoiceLines, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = [...invoiceLines];
    newLines.splice(index, 1);
    setInvoiceLines(newLines);
  };

  const handleLineChange = (index: number, field: keyof InvoiceLine, value: any) => {
    const newLines = [...invoiceLines];
    (newLines[index] as any)[field] = value;
    setInvoiceLines(newLines);
  };

  const calculateTotal = () => {
    return invoiceLines.reduce((acc, line) => acc + (line.quantity || 0) * (line.unitPrice || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('Du måste välja ett projekt.');
      return;
    }

    setIsLoading(true);
    const finalInvoiceLines = invoiceLines.filter(
      line => line.description && line.quantity && typeof line.unitPrice === 'number'
    ) as InvoiceLine[];

    if (finalInvoiceLines.length === 0) {
        toast.error('Du måste lägga till minst en giltig rad i offerten.');
        setIsLoading(false);
        return;
    }
    
    const selectedProject = projects.find(p => p.id === projectId);

    const invoiceData: Omit<Invoice, 'id' | 'status' | 'totalAmount' | 'createdAt'> = {
      projectId,
      customer: { type: 'Company', name: selectedProject?.clientName || 'Okänd Kund'},
      issueDate: new Date().toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // 30 dagar betalningstid
      invoiceLines: finalInvoiceLines,
    };

    try {
      const result = await createInvoice(invoiceData);
      toast.success('Offert skapad!');
      // Omdirigera till den nya offertsidan (antagande om sökväg)
      router.push(`/projects/${projectId}/invoicing`);
    } catch (error) {
      console.error("Fel vid skapande av offert:", error);
      toast.error('Ett fel uppstod när offerten skulle skapas.');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Skapa Ny Offert</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-2">Välj Projekt</label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Välj ett projekt...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName} - {p.clientName}</option>)}
          </select>
        </div>

        <div className="space-y-4 mb-6">
          {invoiceLines.map((line, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-md">
              <input
                type="text"
                placeholder="Beskrivning"
                value={line.description}
                onChange={e => handleLineChange(index, 'description', e.target.value)}
                className="flex-grow bg-gray-600 border-gray-500 rounded py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Antal"
                min="0"
                value={line.quantity}
                onChange={e => handleLineChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                className="w-24 bg-gray-600 border-gray-500 rounded py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Pris per enhet"
                min="0"
                step="0.01"
                value={line.unitPrice}
                onChange={e => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="w-32 bg-gray-600 border-gray-500 rounded py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={() => handleRemoveLine(index)} className="p-2 text-red-400 hover:text-red-300">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button type="button" onClick={handleAddLine} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
            <PlusIcon className="w-5 h-5" />
            Lägg till rad
          </button>
          <div className="text-right text-white">
            <p className="text-gray-400">Totalt:</p>
            <p className="text-2xl font-bold">{calculateTotal().toFixed(2)} SEK</p>
          </div>
        </div>

        <div className="text-right">
          <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            {isLoading ? 'Sparar...' : 'Skapa Offert'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoiceView;
