
'use client';

import React, { useState, useTransition } from 'react';
import { BuildingOffice2Icon, UserIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { createCustomer } from '@/app/actions/customerActions';
import { useModal } from '@/app/contexts/ModalContext';
import { IdentityLookupStep } from './steps/IdentityLookupStep';
import { Customer } from '@/app/types/index';

type Step = 'chooseType' | 'lookup' | 'manual' | 'final';

const CreateCustomerModal = () => {
  const [step, setStep] = useState<Step>('chooseType');
  const [customerType, setCustomerType] = useState<'company' | 'private' | null>(null);
  const [customerData, setCustomerData] = useState<Partial<Customer>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { hideModal } = useModal();

  const handleDataSelect = (data: Partial<Customer>) => {
    handleSave(data);
  };
  
  const handleBackToStart = () => {
    setStep('chooseType');
    setCustomerData({});
    setCustomerType(null);
    setError(null);
  };
  
  const handleSave = (data: Partial<Customer>) => {
      setError(null);
      const finalData = { ...data, customerType };

      startTransition(async () => {
          const result = await createCustomer(finalData);
          if (result.status === 'success') {
              setCustomerData(finalData);
              setStep('final');
          } else {
              setError(result.message || 'Ett okänt fel uppstod.');
              setStep(customerType === 'company' ? 'lookup' : 'lookup'); // Alltid tillbaka till lookup
          }
      });
  }

  const renderStep = () => {
    switch (step) {
      case 'chooseType':
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Vem är den nya kunden?</h2>
            <div className="flex justify-center gap-8">
              <button onClick={() => { setCustomerType('company'); setStep('lookup'); }} className="group flex flex-col items-center justify-center gap-4 p-8 bg-gray-800 hover:bg-cyan-800/60 rounded-lg transition-all duration-200 border border-gray-700 hover:border-cyan-600 w-48 h-48"><BuildingOffice2Icon className="h-12 w-12 text-cyan-400 group-hover:scale-110 transition-transform" /><span className="text-lg font-semibold text-white">Företag</span></button>
              <button onClick={() => { setCustomerType('private'); setStep('lookup'); }} className="group flex flex-col items-center justify-center gap-4 p-8 bg-gray-800 hover:bg-cyan-800/60 rounded-lg transition-all duration-200 border border-gray-700 hover:border-cyan-600 w-48 h-48"><UserIcon className="h-12 w-12 text-cyan-400 group-hover:scale-110 transition-transform" /><span className="text-lg font-semibold text-white">Privatperson</span></button>
            </div>
          </div>
        );
      
      case 'lookup':
        return (
            <div>
                <button onClick={handleBackToStart} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4"><ArrowLeftIcon className="h-4 w-4" />Tillbaka</button>
                <IdentityLookupStep onDataSelect={handleDataSelect} customerType={customerType || 'company'} />
            </div>
        );

      case 'final':
        return (
            <div className="text-center py-8">
                <CheckCircleIcon className="h-20 w-20 text-green-400 mx-auto mb-5 animate-pulse" />
                <h2 className="text-3xl font-bold text-white mb-2">Kund Skapad!</h2>
                <p className="text-gray-300 text-lg mb-6">
                    {customerData.companyName || customerData.name} har lagts till i ditt kundregister.
                </p>
                <button onClick={hideModal} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
                    Stäng
                </button>
            </div>
        )

      default:
        return <p>Okänt steg</p>;
    }
  };

  return (
    <div>
       {isPending && <div className="text-center p-4">Sparar kund...</div>}
       {error && <div className="my-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm"><strong>Fel:</strong> {error}</div>}
       {!isPending && renderStep()}
    </div>
  );
};

export default CreateCustomerModal;
