
'use client';

import React from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const DocumentsView = () => {
  // Hårdkodad data för exempel
  const documents = [
    { name: 'Bygglovsritning.pdf', date: '2023-10-26', url: '#' },
    { name: 'Kvalitetsansvarig_rapport.docx', date: '2023-10-25', url: '#' },
    { name: 'Besiktningsprotokoll.pdf', date: '2023-10-24', url: '#' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Dokumenthantering</h1>
      
      <div className="bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">FILNAMN</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">DATUM</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400 text-right">ÅTGÄRD</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-4 flex items-center">
                    <DocumentDuplicateIcon className="h-6 w-6 mr-3 text-blue-400" />
                    <span className="font-medium text-white">{doc.name}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{doc.date}</td>
                  <td className="py-4 px-4 text-right">
                    <a href={doc.url} download className="text-blue-400 hover:text-blue-300 font-semibold">Ladda ner</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsView;
