'use client';

import React from 'react';
import { FolderPlusIcon } from '@heroicons/react/24/outline';

interface ZeroStateProps {
    onOpenCreateModal: () => void;
}

export default function ZeroState({ onOpenCreateModal }: ZeroStateProps) {
    return (
        <div className="text-center bg-gray-800/50 p-12 rounded-xl border border-dashed border-gray-600">
            <FolderPlusIcon className="mx-auto h-16 w-16 text-gray-500" />
            <h3 className="mt-4 text-xl font-semibold text-white">Dags att skapa ditt första projekt</h3>
            <p className="mt-2 text-md text-gray-400">Kom igång genom att skapa en ny offert. Jag guidar dig genom stegen.</p>
            <div className="mt-6">
                <button
                    type="button"
                    onClick={onOpenCreateModal}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                    Skapa Ny Offert
                </button>
            </div>
        </div>
    );
}
