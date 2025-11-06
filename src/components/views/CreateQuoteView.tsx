
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Customer, InvoiceLine, InvoiceCreationData } from '@/app/types'; // Importera alla nödvändiga typer
import { createInvoice } from '@/app/actions/invoiceActions'; // Denna action skapar en invoice/offert
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

interface CreateQuoteViewProps {
  projects: Project[];
  customers: Customer[]; // Skicka med kunddata för att kunna bygga fakturaobjektet korrekt
}

// VÄRLDSKLASS-KORRIGERING: Byt namn på komponenten för att reflektera dess syfte
const CreateQuoteView: React.FC<CreateQuoteViewProps> = ({ projects, customers }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [projectId, setProjectId] = useState<string>('');
  
  // VÄRLDSKLASS-KORRIGERING: Använder det korrekta fältnamnet 'unitPrice' som definierat i InvoiceLine
  const [invoiceLines, setInvoiceLines] = useState<Partial<InvoiceLine>[]>([{ description: '', quantity: 1, unit: 'st', unitPrice: 0 }]);

  const handleAddLine = () => {
    setInvoiceLines([...invoiceLines, { description: '', quantity: 1, unit: 'st', unitPrice: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = [...invoiceLines];
    newLines.splice(index, 1);
    setInvoiceLines(newLines);
  };

  const handleLineChange = (index: number, field: keyof InvoiceLine, value: any) => {
    const newLines = [...invoiceLines];
    const line = newLines[index] as Partial<InvoiceLine>;

    if (field === 'quantity' || field === 'unitPrice') {
        (line as any)[field] = parseFloat(value) || 0;
    } else {
        (line as any)[field] = value;
    }
    setInvoiceLines(newLines);
  };

  const calculateTotal = () => {
    // VÄRLDSKLASS-KORRIGERING: Korrekt beräkning med 'unitPrice'
    return invoiceLines.reduce((acc, line) => acc + (line.quantity || 0) * (line.unitPrice || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('Du måste välja ett projekt.');
      return;
    }

    const selectedProject = projects.find(p => p.id === projectId);
    if (!selectedProject) {
        toast.error('Kunde inte hitta det valda projektet.');
        return;
    }
    
    const customer = customers.find(c => c.id === selectedProject.customerId);
    if (!customer) {
        toast.error('Kunde inte hitta kunden kopplad till projektet.');
        return;
    }

    const finalInvoiceLines = invoiceLines.filter(
      line => line.description && line.quantity && typeof line.unitPrice === 'number'
    ) as InvoiceLine[];

    if (finalInvoiceLines.length === 0) {
        toast.error('Du måste lägga till minst en giltig rad i offerten.');
        return;
    }

    // VÄRLDSKLASS-KORRIGERING: Skapar ett korrekt format för InvoiceCreationData
    const invoiceData: InvoiceCreationData = {
      projectId,
      customer, // Hela kundobjektet
      issueDate: new Date(),
      dueDate: new Date(), // Sätts ofta senare för fakturor, men krävs av typen
      invoiceLines: finalInvoiceLines,
      rotDeduction: { // Inkludera standardvärde för ROT
          isApplicable: false,
          amount: 0,
          laborCost: 0,
      }
    };

    startTransition(async () => {
        try {
            // Anropar server action med det korrekt typade objektet
            await createInvoice(invoiceData);
            toast.success('Offert skapad! Omdirigerar...');
            router.push(`/dashboard/projects/${projectId}?tab=invoicing`);
        } catch (error) {
            console.error("Fel vid skapande av offert:", error);
            toast.error(error instanceof Error ? error.message : 'Ett okänt fel uppstod.');
        }
    });
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
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          >
            <option value="" disabled>Välj ett projekt...</option>
            {/* VÄRLDSKLASS-KORRIGERING: Använder korrekta fältnamn */}
            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName} - {p.customerName}</option>)}
          </select>
        </div>

        <div className="space-y-4 mb-6">
          {invoiceLines.map((line, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-md">
              <input type="text" placeholder="Beskrivning" value={line.description} onChange={e => handleLineChange(index, 'description', e.target.value)} className="flex-grow bg-gray-600 border-gray-500 rounded py-2 px-3 text-white"/>
              <input type="number" placeholder="Antal" min="0" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', e.target.value)} className="w-24 bg-gray-600 border-gray-500 rounded py-2 px-3 text-white" />
              <input type="text" placeholder="Enhet (st, m, etc)" value={line.unit} onChange={e => handleLineChange(index, 'unit', e.target.value)} className="w-24 bg-gray-600 border-gray-500 rounded py-2 px-3 text-white" />
              <input type="number" placeholder="Pris per enhet" min="0" step="0.01" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', e.target.value)} className="w-32 bg-gray-600 border-gray-500 rounded py-2 px-3 text-white" />
              <button type="button" onClick={() => handleRemoveLine(index)} className="p-2 text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5" /></button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button type="button" onClick={handleAddLine} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"><PlusIcon className="w-5 h-5" />Lägg till rad</button>
          <div className="text-right text-white"><p className="text-gray-400">Totalt:</p><p className="text-2xl font-bold">{calculateTotal().toFixed(2)} SEK</p></div>
        </div>

        <div className="text-right">
          <button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            {isPending ? 'Sparar...' : 'Skapa Offert'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuoteView;
