'use client';
import React from 'react';
import { IconProjects, IconCustomers, IconDocuments } from '@/app/constants';

interface SearchResultsProps {
    results: { type: string; data: any }[];
}

const getIcon = (type: string) => {
    switch (type) {
        case 'Projekt':
            return <IconProjects className="w-5 h-5 text-cyan-400" />;
        case 'Kund':
            return <IconCustomers className="w-5 h-5 text-yellow-400" />;
        case 'Dokument':
            return <IconDocuments className="w-5 h-5 text-purple-400" />;
        default:
            return null;
    }
};

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
    if (results.length === 0) {
        return (
             <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20 animate-fade-in-fast">
                <p className="p-4 text-sm text-gray-500">Inga träffar.</p>
            </div>
        )
    }

    return (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto animate-fade-in-fast">
            <ul>
                {results.map((result, index) => (
                    <li key={index} className="border-b border-gray-800 last:border-b-0">
                        <button className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors">
                            {getIcon(result.type)}
                            <div>
                                <p className="text-sm font-medium text-gray-200">{result.data.name}</p>
                                <p className="text-xs text-gray-500">
                                    {result.type} 
                                    {result.data.customer && ` - ${result.data.customer.name}`}
                                </p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchResults;
