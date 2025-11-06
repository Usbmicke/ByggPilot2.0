
'use client';

import React, { useState, useEffect } from 'react';
import { Project, Invoice, InvoiceLine, RotDeduction, InvoiceCreationData, Customer } from '@/app/types';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  customer: Customer;
  onSave: (newInvoiceData: InvoiceCreationData) => Promise<void>;
}

const emptyLine: Omit<InvoiceLine, 'id'> = { description: '', quantity: 1, unit: 'st', unitPrice: 0 };

export default function InvoiceModal({ isOpen, onClose, project, customer, onSave }: InvoiceModalProps) {
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
  const [invoiceLines, setInvoiceLines] = useState<Partial<InvoiceLine>[]>([emptyLine]);
  
  const [applyRot, setApplyRot] = useState(false);
  const [rotData, setRotData] = useState<Partial<RotDeduction>>({ isApplicable: false, laborCost: 0, amount: 0 });

  const [isSaving, setIsSaving] = useState(false);

  const handleLineChange = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const newLines = [...invoiceLines];
    const line = newLines[index] as InvoiceLine;
    if (field === 'quantity' || field === 'unitPrice') {
      (line as any)[field] = Number(value) || 0;
    } else {
      (line as any)[field] = value as string;
    }
    setInvoiceLines(newLines);
  };

  const addLine = () => setInvoiceLines([...invoiceLines, { ...emptyLine }]);
  const removeLine = (index: number) => setInvoiceLines(invoiceLines.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const finalInvoiceLines = invoiceLines.filter(
        (line) => line.description && line.description.trim() !== '' && line.quantity && line.quantity > 0 && line.unitPrice && line.unitPrice > 0
    ) as InvoiceLine[];

    const newInvoiceData: InvoiceCreationData = {
      projectId: project.id,
      customer: customer,
      invoiceLines: finalInvoiceLines,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      rotDeduction: {
          isApplicable: applyRot,
          personNumber: applyRot ? rotData.personNumber : undefined,
          laborCost: applyRot ? rotData.laborCost || 0 : 0,
          amount: applyRot ? (rotData.laborCost || 0) * 0.3 : 0, 
      },
    };

    try {
      await onSave(newInvoiceData);
    } catch (error) {
      // Error logging should be handled in the parent component
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-300">Kund</label>
                  <input type="text" value={customer?.name || ''} readOnly className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md py-2 px-3 text-gray-400" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">Projekt</label>
                  <input type="text" value={project.name} readOnly className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md py-2 px-3 text-gray-400" />
              </div>
              {/* ... datumfält ... */}
            </div>

             {invoiceLines.map((line, index) => (
                 <div key={index} className="flex items-center gap-2">
                     <input type="text" placeholder="Beskrivning" value={line.description} onChange={(e) => handleLineChange(index, 'description', e.target.value)} className="flex-grow bg-gray-700 p-2 rounded-md" />
                     <input type="number" placeholder="Antal" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', e.target.value)} className="w-20 bg-gray-700 p-2 rounded-md" />
                     <input type="text" placeholder="Enhet" value={line.unit} onChange={(e) => handleLineChange(index, 'unit', e.target.value)} className="w-20 bg-gray-700 p-2 rounded-md" />
                     <input type="number" placeholder="Pris" value={line.unitPrice} onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)} className="w-24 bg-gray-700 p-2 rounded-md" />
                     <button type="button" onClick={() => removeLine(index)} className="p-2 text-red-500"><TrashIcon className="h-5 w-5" /></button>
                 </div>
             ))}
             <button type="button" onClick={addLine} className="flex items-center gap-2 text-cyan-400"><PlusIcon className="h-5 w-5"/> Lägg till rad</button>
            
            <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center">
                    <input type="checkbox" id="applyRot" checked={applyRot} onChange={e => setApplyRot(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                    <label htmlFor="applyRot" className="ml-3 block text-lg font-semibold text-white">Ansök om ROT-avdrag</label>
                </div>
                {applyRot && (
                    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
                        <div>
                            <label htmlFor="rot-pnr" className="block text-sm font-medium text-gray-300">Kundens Personnummer</label>
                            <input type="text" id="rot-pnr" placeholder="ÅÅÅÅMMDD-XXXX" onChange={e => setRotData({...rotData, personNumber: e.target.value})} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
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
              <button type="submit" form="invoice-form" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-500" disabled={isSaving}>
                  {isSaving ? 'Sparar...' : 'Spara Utkast'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
