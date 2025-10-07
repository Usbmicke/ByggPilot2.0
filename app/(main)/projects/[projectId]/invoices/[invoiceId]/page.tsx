'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowDownTrayIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { Invoice, Project, RotDeduction } from '@/types';
import SendInvoiceModal from '@/components/SendInvoiceModal';

// --- Klientkomponenter flyttade hit för tydlighet ---

const DetailRow = ({ label, value }: { label: string; value: string | number; }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
);

const InvoiceLinesTable = ({ invoice }: { invoice: Invoice }) => (
    <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-3">Fakturarader</h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Beskrivning</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Antal</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Á-pris</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Moms</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Summa</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {invoice.invoiceLines.map((line, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{line.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">{line.quantity} {line.unit}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">{line.unitPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">{line.vatRate}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white text-right">{(line.quantity * line.unitPrice).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const RotDeductionDetails = ({ rotDeduction }: { rotDeduction: RotDeduction }) => (
    <div className="mt-8 bg-teal-900/50 border border-teal-700 rounded-xl p-5">
        <h3 className="text-lg leading-6 font-medium text-teal-300">ROT-avdragsinformation</h3>
        <dl className="mt-4 sm:divide-y sm:divide-teal-800">
            <DetailRow label="Personnummer" value={rotDeduction.customerPersonalId} />
            <DetailRow label="Fastighetsbeteckning" value={rotDeduction.propertyId} />
            <DetailRow label="Arbetskostnad" value={`${rotDeduction.laborCost.toLocaleString('sv-SE')} kr`} />
        </dl>
    </div>
);


function InvoiceDetailPageClient({ initialInvoice, project }: { initialInvoice: Invoice, project: Project }) {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    const subTotal = invoice.invoiceLines.reduce((acc, line) => acc + line.unitPrice * line.quantity, 0);
    const totalVat = invoice.invoiceLines.reduce((acc, line) => acc + (line.unitPrice * line.quantity * (line.vatRate / 100)), 0);
    const grandTotal = subTotal + totalVat;

    const handleInvoiceSent = () => {
        setInvoice(prev => ({ ...prev, status: 'Skickad' }));
        setIsSendModalOpen(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* ... Header och knappar ... */}
            <Link href={`/projects/${project.id}?view=invoicing`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">&larr; Tillbaka till fakturaöversikt</Link>
            
            <div className="flex justify-between items-start mt-4">
                 <div>
                    <h1 className="text-3xl font-bold text-white">Faktura #{invoice.id.substring(0,8)}</h1>
                    <p className="text-gray-400 mt-1">Status: <span className="font-semibold text-cyan-300">{invoice.status}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/api/projects/${project.id}/invoices/${invoice.id}/pdf`} target="_blank" className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5" /> PDF
                    </Link>
                    <button 
                        onClick={() => setIsSendModalOpen(true)} 
                        disabled={invoice.status === 'Skickad'}
                        className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <EnvelopeIcon className="w-5 h-5" /> {invoice.status === 'Skickad' ? 'Skickad' : 'Skicka'}
                    </button>
                </div>
            </div>

            {/* -- Huvudinformation -- */}
            <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-white">Fakturadetaljer</h3>
                </div>
                <div className="border-t border-gray-700 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-700 px-6">
                        <DetailRow label="Kund" value={invoice.customer.name} />
                        <DetailRow label="Projekt" value={project.name} />
                        <DetailRow label="Fakturadatum" value={new Date(invoice.issueDate).toLocaleDateString('sv-SE')} />
                        <DetailRow label="Förfallodatum" value={new Date(invoice.dueDate).toLocaleDateString('sv-SE')} />
                        <DetailRow label="Totalsumma" value={`${grandTotal.toLocaleString('sv-SE')} kr`} />
                    </dl>
                </div>
            </div>

            {/* -- Visa ROT-info om det finns -- */}
            {invoice.rotDeduction && <RotDeductionDetails rotDeduction={invoice.rotDeduction} />}

            {/* -- Visa fakturarader -- */}
            <InvoiceLinesTable invoice={invoice} />

            {/* -- Modal -- */}
            <SendInvoiceModal 
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                invoice={invoice}
                project={project}
                onInvoiceSent={handleInvoiceSent}
            />
        </div>
    );
}

// ---- Server-komponent (Wrapper) ----
import { auth } from '@/lib/auth';
import { getProject } from '@/services/projectService';
import { getInvoiceFromFirestore } from '@/services/firestoreService';

export default async function InvoiceDetailPage({ params }: { params: { projectId: string; invoiceId: string; }}) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) { notFound(); }

    const project = await getProject(params.projectId, userId);
    const invoice = await getInvoiceFromFirestore(params.projectId, params.invoiceId);
    if (!project || !invoice) { notFound(); }

    return <InvoiceDetailPageClient initialInvoice={invoice} project={project} />;
}
