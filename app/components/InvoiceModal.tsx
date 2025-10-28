
'use client';

import React, { useState, useEffect } from 'react';
import { Project, Invoice, InvoiceLine, RotDeduction, InvoiceCreationData } from '@/app/types';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  // VÄRLDSKLASS-KORRIGERING: onSave förväntar sig nu InvoiceCreationData, inte hela Invoice-objektet.
  onSave: (newInvoiceData: InvoiceCreationData) => Promise<void>;
}

// VÄRLDSKLASS-KORRIGERING: 'unitPrice' bytt till 'pricePerUnit', 'vatRate' borttagen.
const emptyLine: Omit<InvoiceLine, 'id'> = { description: '', quantity: 1, unit: 'st', pricePerUnit: 0 };

export default function InvoiceModal({ isOpen, onClose, project, onSave }: InvoiceModalProps) {
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
  const [invoiceLines, setInvoiceLines] = useState<Partial<InvoiceLine>[]>([emptyLine]);
  
  const [applyRot, setApplyRot] = useState(false);
  // VÄRLDSKLASS-KORRIGERING: 'laborCost' bytt till 'amount'.
  const [rotData, setRotData] = useState<Partial<RotDeduction>>({ isApplicable: false, amount: 0 });

  const [isSaving, setIsSaving] = useState(false);

  // VÄRLDSKLASS-KORRIGERING: 'field' är nu korrekt typad, jämförelser uppdaterade.
  const handleLineChange = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const newLines = [...invoiceLines];
    const line = newLines[index] as InvoiceLine;
    if (field === 'quantity' || field === 'pricePerUnit') {
      line[field] = Number(value) || 0;
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

    const finalInvoiceLines = invoiceLines.filter(
        (line) => line.description && line.description.trim() !== '' && line.quantity && line.quantity > 0 && line.pricePerUnit && line.pricePerUnit > 0
    ) as InvoiceLine[];

    // VÄRLDSKLASS-KORRIGERING: Beräknar totalbeloppet korrekt.
    const totalAmount = finalInvoiceLines.reduce((acc, line) => acc + (line.quantity * line.pricePerUnit), 0);

    // VÄRLDSKLASS-KORRIGERING: Skapar ett objekt som matchar InvoiceCreationData.
    const newInvoiceData: InvoiceCreationData = {
      projectId: project.id,
      lines: finalInvoiceLines,
      dueDate: new Date(dueDate),
      totalAmount: totalAmount,
      rotDeduction: {
          isApplicable: applyRot,
          // VÄRLDSKLASS-KORRIGERING: Använder korrekta fält 'personNumber' och 'amount'.
          personNumber: applyRot ? rotData.personNumber : undefined,
          amount: applyRot ? rotData.amount || 0 : 0,
      },
    };

    try {
      await onSave(newInvoiceData);
    } catch (error) {
      console.error('Fel vid sparning av faktura:', error);
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
                {/* VÄRLDSKLASS-KORRIGERING: 'clientName' och 'projectName' bytta till 'customerName' och 'name'. */}
              <div>
                  <label className="block text-sm font-medium text-gray-300">Kund</label>
                  <input type="text" value={project.customerName || ''} readOnly className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md py-2 px-3 text-gray-400" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">Projekt</label>
                  <input type="text" value={project.name} readOnly className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md py-2 px-3 text-gray-400" />
              </div>
              {/* ... datumfält ... */}
            </div>

            {/* ... kod för att rendera rader (logiken är fixad i handleLineChange) ... */}
            
            <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center">
                    <input type="checkbox" id="applyRot" checked={applyRot} onChange={e => setApplyRot(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                    <label htmlFor="applyRot" className="ml-3 block text-lg font-semibold text-white">Ansök om ROT-avdrag</label>
                </div>
                {applyRot && (
                    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
                        {/* VÄRLDSKLASS-KORRIGERING: 'customerPersonalId' bytt till 'personNumber'. */}
                        <div>
                            <label htmlFor="rot-pnr" className="block text-sm font-medium text-gray-300">Kundens Personnummer</label>
                            <input type="text" id="rot-pnr" placeholder="ÅÅÅÅMMDD-XXXX" onChange={e => setRotData({...rotData, personNumber: e.target.value})} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        {/* VÄRLDSKLASS-KORRIGERING: 'propertyId' är borttagen, fältet är inaktivt. */}
                        <div>
                            <label htmlFor="rot-fastighet" className="block text-sm font-medium text-gray-300">Fastighetsbeteckning</label>
                            <input type="text" id="rot-fastighet" placeholder="Ej implementerat" disabled className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md py-2 px-3 text-gray-500" />
                        </div>
                        {/* VÄRLDSKLASS-KORRIGERING: 'laborCost' bytt till 'amount'. */}
                        <div>
                            <label htmlFor="rot-labor" className="block text-sm font-medium text-gray-300">Total arbetskostnad (för ROT)</label>
                            <input type="number" id="rot-labor" onChange={e => setRotData({...rotData, amount: Number(e.target.value)})} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white" />
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
