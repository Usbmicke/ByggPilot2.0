'use client';

import React, { useState } from 'react';
import { Project, Invoice, InvoiceLine, RotDeduction } from '@/app/types';
import { XMarkIcon, PlusIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (newInvoice: Invoice) => void;
}

const emptyLine: InvoiceLine = { description: '', quantity: 1, unit: 'st', unitPrice: 0, vatRate: 25 };

export default function InvoiceModal({ isOpen, onClose, project, onSave }: InvoiceModalProps) {
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([emptyLine]);
  
  // State för ROT-avdrag
  const [applyRot, setApplyRot] = useState(false);
  const [rotData, setRotData] = useState<Partial<RotDeduction>>({ laborCost: 0 });

  const [isSaving, setIsSaving] = useState(false);

  const handleLineChange = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const newLines = [...invoiceLines];
    const line = newLines[index];
    if (field === 'quantity' || field === 'unitPrice' || field === 'vatRate') {
      (line[field] as number) = Number(value) || 0;
    } else {
      (line[field] as string) = value as string;
    }
    setInvoiceLines(newLines);
  };

  const addLine = () => setInvoiceLines([...invoiceLines, { ...emptyLine }]);
  const removeLine = (index: number) => setInvoiceLines(invoiceLines.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const finalInvoiceLines = invoiceLines.filter(line => line.description.trim() !== '' && line.quantity > 0 && line.unitPrice > 0);

    const newInvoiceData: Omit<Invoice, 'id'> = {
      projectId: project.id,
      customer: { type: 'PrivatePerson', name: project.customerName },
      issueDate: new Date(issueDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      invoiceLines: finalInvoiceLines,
      status: 'Utkast',
    };

    if (applyRot && rotData.customerPersonalId && rotData.propertyId && rotData.laborCost) {
        newInvoiceData.rotDeduction = rotData as RotDeduction;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoiceData),
      });

      if (!response.ok) throw new Error('Kunde inte spara fakturautkast.');
      
      const savedInvoice: Invoice = await response.json();
      onSave(savedInvoice);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col">
        <form id="invoice-form" onSubmit={handleSubmit} className="flex-grow flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Skapa Fakturaunderlag</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          
          <div className="overflow-y-auto p-5 space-y-6">
            {/* ... (kund/projekt-info, datum) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-300">Kund</label>
                  <input type="text" defaultValue={project.customerName} readOnly className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md py-2 px-3 text-gray-400" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">Projekt</label>
                  <input type="text" defaultValue={project.name} readOnly className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md py-2 px-3 text-gray-400" />
              </div>
              <div>
                  <label htmlFor="issueDate" className="block text-sm font-medium text-gray-300">Fakturadatum</label>
                  <input type="date" id="issueDate" value={issueDate} onChange={e => setIssueDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
              </div>
              <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300">Förfallodatum</label>
                  <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
              </div>
            </div>

            {/* Fakturarader */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">Fakturarader</h3>
              {/* ... (kod för att rendera rader) ... */}
            </div>

            {/* ROT-AVDRAG */}
            <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center">
                    <input type="checkbox" id="applyRot" checked={applyRot} onChange={e => setApplyRot(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                    <label htmlFor="applyRot" className="ml-3 block text-lg font-semibold text-white">Ansök om ROT-avdrag</label>
                </div>
                {applyRot && (
                    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
                        <div>
                            <label htmlFor="rot-pnr" className="block text-sm font-medium text-gray-300">Kundens Personnummer</label>
                            <input type="text" id="rot-pnr" placeholder="ÅÅÅÅMMDD-XXXX" onChange={e => setRotData({...rotData, customerPersonalId: e.target.value})} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div>
                            <label htmlFor="rot-fastighet" className="block text-sm font-medium text-gray-300">Fastighetsbeteckning</label>
                            <div className="flex items-center gap-2">
                                <input type="text" id="rot-fastighet" placeholder="T.ex. GÄDDAN 11" onChange={e => setRotData({...rotData, propertyId: e.target.value})} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                                <button type="button" disabled className="mt-1 bg-gray-600 text-white font-semibold py-2 px-3 rounded-lg flex items-center gap-2 disabled:opacity-50 cursor-not-allowed">
                                    <SparklesIcon className="w-5 h-5" /> Hämta
                                </button>
                            </div>
                             <p className="mt-1 text-xs text-gray-400">// TODO: ByggPilot kommer snart att kunna hämta detta automatiskt baserat på kundens adress.</p>
                        </div>
                        <div>
                            <label htmlFor="rot-labor" className="block text-sm font-medium text-gray-300">Total arbetskostnad (för ROT)</label>
                            <input type="number" id="rot-labor" onChange={e => setRotData({...rotData, laborCost: Number(e.target.value)})} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                    </div>
                )}
            </div>

          </div>

          <div className="p-5 border-t border-gray-700 mt-auto flex justify-end gap-4 bg-gray-800 rounded-b-xl">
              <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg">Avbryt</button>
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-500" disabled={isSaving}>
                  {isSaving ? 'Sparar...' : 'Spara Utkast'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
