
'use client';

import React from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const DocumentsPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold leading-6 text-text-primary">Dokument</h1>
                <p className="mt-2 text-sm text-text-secondary">
                    En central plats för alla dina projektdokument, offerter och KMA-pärmar.
                </p>
            </div>
        </div>

        <div className="text-center py-20 border-2 border-dashed border-border-primary rounded-lg mt-8">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-lg font-semibold text-text-primary">Kommer Snart</h3>
            <p className="mt-1 text-sm text-text-secondary">Vi integrerar just nu med Google Drive för att ge dig automatisk dokumenthantering.</p>
        </div>
    </div>
  );
};

export default DocumentsPage;
