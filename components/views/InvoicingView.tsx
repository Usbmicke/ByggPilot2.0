'use client';

import React, { useState } from 'react';
import { Project, Invoice } from '@/types';
import { PlusIcon, HomeModernIcon } from '@heroicons/react/24/solid';
import InvoiceModal from '@/components/InvoiceModal';
import Link from 'next/link';

interface InvoicingViewProps {
  project: Project;
  initialInvoices?: Invoice[];
}

const InvoiceRow = ({ invoice, projectId }: { invoice: Invoice, projectId: string }) => {
    const totalAmount = invoice.invoiceLines.reduce((acc, line) => acc + (line.unitPrice * line.quantity * (1 + line.vatRate / 100)), 0);

    return (
      <Link href={`/projects/${projectId}/invoices/${invoice.id}`} passHref>
        <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 transition-colors duration-150 cursor-pointer">
            <div className="col-span-3 font-medium text-white truncate flex items-center gap-2">
                <span>{invoice.id.substring(0, 8)}...</span>
                {invoice.rotDeduction && (
                    <HomeModernIcon className="w-5 h-5 text-teal-400" title="Innehåller ROT-avdrag" />
                )}
            </div>
            <div className="col-span-3 text-gray-400">{new Date(invoice.issueDate).toLocaleDateString('sv-SE')}</div>
            <div className="col-span-3 text-gray-400">{totalAmount.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</div>
            <div className="col-span-2 flex items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300`}>
                    {invoice.status}
                </span>
            </div>
            <div className="col-span-1 text-right text-gray-400">...</div>
        </div>
      </Link>
    );
};

export default function InvoicingView({ project, initialInvoices = [] }: InvoicingViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices(currentInvoices => [newInvoice, ...currentInvoices]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Fakturering</h1>
                <p className="text-gray-400">Projekt: {project.name}</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition-colors duration-300"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Skapa Underlag</span>
            </button>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl mt-4">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-gray-400 font-bold text-sm">
                <div className="col-span-3">Fakturanr</div>
                <div className="col-span-3">Datum</div>
                <div className="col-span-3">Belopp (inkl. moms)</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1"></div>
            </div>

            {invoices.length > 0 ? (
                invoices.map(invoice => <InvoiceRow key={invoice.id} invoice={invoice} projectId={project.id} />)
            ) : (
                <div className="p-8 text-center text-gray-400">
                    <h3 className="text-lg font-semibold text-white">Inga fakturaunderlag</h3>
                    <p className="mt-2">Klicka på "Skapa Underlag" för att skapa det första underlaget.</p>
                </div>
            )}
        </div>

        <InvoiceModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            project={project}
            onSave={handleInvoiceCreated}
        />
    </div>
  );
}
