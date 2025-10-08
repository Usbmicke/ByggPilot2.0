'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/client';
import { Calculation, CalculationItem, CalculationCategory } from '@/types/calculation';
import CalculationSection from './CalculationSection';

enum SaveStatus { IDLE = 'Alla ändringar sparade', SAVING = 'Sparar...', ERROR = 'Fel vid sparande' };
enum PdfStatus { IDLE, GENERATING, DONE, ERROR };

interface CalculationEngineProps {
    projectId: string;
}

export default function CalculationEngine({ projectId }: CalculationEngineProps) {
    const [calculation, setCalculation] = useState<Calculation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.IDLE);
    const [pdfStatus, setPdfStatus] = useState<PdfStatus>(PdfStatus.IDLE);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (!projectId) return;
        const calcDocRef = doc(db, 'projects', projectId, 'calculations', 'main');
        const unsubscribe = onSnapshot(calcDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as Calculation;
                setCalculation(data);
                // Återställ PDF-status om kalkylen ändras efter att en PDF har skapats
                if (pdfStatus === PdfStatus.DONE) {
                    setPdfStatus(PdfStatus.IDLE);
                    setPdfUrl(null);
                }
            } else {
                const initialCalc: Calculation = { items: [], profitMarginPercentage: 15 };
                setCalculation(initialCalc);
            }
            setIsLoading(false);
            isInitialLoad.current = false;
        }, (err) => {
            console.error("Fel vid hämtning av kalkyl:", err);
            setError("Kalkylen kunde inte laddas.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [projectId, pdfStatus]); // pdfStatus tillagd för att kunna återställa

    const saveCalculation = useCallback(async (calcToSave: Calculation) => {
        if (!projectId) return;
        setSaveStatus(SaveStatus.SAVING);
        const calcDocRef = doc(db, 'projects', projectId, 'calculations', 'main');
        try {
            await setDoc(calcDocRef, calcToSave, { merge: true });
            setSaveStatus(SaveStatus.IDLE);
        } catch (err) {
            console.error("Fel vid sparande av kalkyl:", err);
            setSaveStatus(SaveStatus.ERROR);
        }
    }, [projectId]);

    const triggerSave = (calc: Calculation) => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (!isInitialLoad.current) {
            setSaveStatus(SaveStatus.SAVING);
            debounceTimeout.current = setTimeout(() => {
                saveCalculation(calc);
            }, 1500);
        }
    };

    const handleSectionUpdate = (category: CalculationCategory, updatedItems: CalculationItem[]) => {
        if (!calculation) return;
        const updatedCalculation = { ...calculation, items: [...calculation.items.filter(item => item.category !== category), ...updatedItems] };
        setCalculation(updatedCalculation);
        triggerSave(updatedCalculation);
    };
    
    const handleProfitMarginChange = (newMargin: number) => {
        if (!calculation) return;
        const updatedCalculation = { ...calculation, profitMarginPercentage: newMargin };
        setCalculation(updatedCalculation);
        triggerSave(updatedCalculation);
    };

    const handleGeneratePdf = async () => {
        if (!projectId) return;
        setPdfStatus(PdfStatus.GENERATING);
        try {
            const response = await fetch('/api/generate-offer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            });

            if (!response.ok) {
                throw new Error(`Kunde inte generera PDF: ${response.statusText}`);
            }

            const { pdfUrl } = await response.json();
            setPdfUrl(pdfUrl);
            setPdfStatus(PdfStatus.DONE);
        } catch (err) {
            console.error(err);
            setPdfStatus(PdfStatus.ERROR);
        }
    };

    if (isLoading) return <p className="text-center text-gray-400 py-8">Laddar kalkylator...</p>;
    if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
    if (!calculation) return null;

    const { items, profitMarginPercentage } = calculation;
    const materialItems = items.filter(item => item.category === 'Material');
    const arbeteItems = items.filter(item => item.category === 'Arbete');
    const ueItems = items.filter(item => item.category === 'Underentreprenör');
    const ovrigtItems = items.filter(item => item.category === 'Övrigt');

    const totalSelfCost = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const profitAmount = totalSelfCost * (profitMarginPercentage / 100);
    const totalExclVat = totalSelfCost + profitAmount;
    const totalInclVat = totalExclVat * 1.25;

    const getButtonText = () => {
        switch(pdfStatus) {
            case PdfStatus.IDLE: return 'Generera PDF-offert';
            case PdfStatus.GENERATING: return 'Genererar...';
            case PdfStatus.DONE: return 'Offert Skapad';
            case PdfStatus.ERROR: return 'Försök Igen';
        }
    };

    return (
        <div className="bg-gray-800/80 p-6 rounded-lg border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Offertkalkyl</h2>
                <span className={`text-sm font-mono px-3 py-1 rounded-full ${saveStatus === SaveStatus.IDLE ? 'text-green-300 bg-green-900/50' : 'text-yellow-300 bg-yellow-900/50'}`}>
                    {saveStatus}
                </span>
            </div>
            <div className="space-y-8">
                <CalculationSection title="Material" category="Material" items={materialItems} onUpdate={(items) => handleSectionUpdate('Material', items)} />
                <CalculationSection title="Arbete" category="Arbete" items={arbeteItems} onUpdate={(items) => handleSectionUpdate('Arbete', items)} />
                <CalculationSection title="Underentreprenör" category="Underentreprenör" items={ueItems} onUpdate={(items) => handleSectionUpdate('Underentreprenör', items)} />
                <CalculationSection title="Övrigt" category="Övrigt" items={ovrigtItems} onUpdate={(items) => handleSectionUpdate('Övrigt', items)} />
            </div>

            <div className="mt-10 pt-6 border-t-2 border-cyan-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Sammanfattning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-900/50 p-6 rounded-lg">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total självkostnad (ex. moms):</span>
                            <span className="font-mono text-gray-300">{totalSelfCost.toFixed(2)} kr</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Vinstpåslag:</span>
                            <div className="flex items-center">
                                <input type="number" value={profitMarginPercentage} onChange={e => handleProfitMarginChange(parseFloat(e.target.value) || 0)} className="w-20 bg-gray-700 p-1 rounded-md text-sm text-right font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                                <span className="ml-2 font-mono text-gray-300">%</span>
                            </div>
                        </div>
                         <div className="flex justify-between text-sm pt-2 border-t border-gray-600">
                            <span className="text-gray-400">Vinst:</span>
                            <span className="font-mono text-gray-300">{profitAmount.toFixed(2)} kr</span>
                        </div>
                    </div>
                    <div className="space-y-4 bg-gray-800 p-4 rounded-md border border-gray-700 shadow-inner">
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-300">Pris till kund (ex. moms):</span>
                            <span className="font-bold text-xl text-white">{totalExclVat.toFixed(2)} kr</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-300">Pris till kund (inkl. moms):</span>
                            <span className="font-bold text-2xl text-cyan-400">{totalInclVat.toFixed(2)} kr</span>
                        </div>
                        <div className="pt-4 mt-4 border-t border-gray-700">
                             <button onClick={handleGeneratePdf} disabled={pdfStatus === PdfStatus.GENERATING || pdfStatus === PdfStatus.DONE} className={`w-full text-white font-bold py-2 px-4 rounded-md transition-colors ${pdfStatus === PdfStatus.DONE ? 'bg-green-600 cursor-default' : pdfStatus === PdfStatus.GENERATING ? 'bg-gray-500 cursor-wait' : 'bg-cyan-600 hover:bg-cyan-700' }`}>
                                {getButtonText()}
                            </button>
                            {pdfStatus === PdfStatus.DONE && pdfUrl && (
                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-cyan-400 hover:text-cyan-300 text-sm mt-2">
                                    Öppna PDF
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
