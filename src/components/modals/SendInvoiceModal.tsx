
"use client";

import React, { useState, useEffect } from 'react';
import { Invoice, Project, Customer } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  project: Project;
}

const SendInvoiceModal: React.FC<SendInvoiceModalProps> = ({ isOpen, onClose, invoice, project }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && project.customer) {
      setCustomer(project.customer);
    }
  }, [isOpen, project]);

  const handleSendInvoice = async () => {
    console.log("Skickar faktura...", { invoice, customer });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Skicka Faktura</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Projekt</p>
            <p className="font-semibold">{project.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Faktura-ID</p>
            <p className="font-semibold">{invoice.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Belopp</p>
            <p className="font-semibold">{invoice.totalAmount} SEK</p>
          </div>

          {isLoading && <p>Laddar kundinformation...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          {customer && (
            <div>
              <p className="text-sm text-gray-500">Skickas till</p>
              <p className="font-semibold">{customer.name}</p>
              <p className="text-gray-600">{customer.email}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Avbryt
          </button>
          <button 
            onClick={handleSendInvoice}
            disabled={!customer}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Skicka
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendInvoiceModal;
