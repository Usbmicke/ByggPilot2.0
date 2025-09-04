'use client';

import React, { useState, useEffect } from 'react';
import { IconFileText, IconFolderOpen } from '@/app/constants';

// Dummy data för demonstration - detta kommer att ersättas med riktig data
const dummyDocuments = [
  { id: 'doc1', name: 'Anbudsunderlag.pdf', type: 'pdf', size: '2.3 MB', lastModified: '2023-10-27' },
  { id: 'doc2', name: 'Ritningar.dwg', type: 'dwg', size: '15.1 MB', lastModified: '2023-10-26' },
  { id: 'doc3', name: 'Mötesprotokoll 2023-10-25.docx', type: 'word', size: '128 KB', lastModified: '2023-10-25' },
];

type DocumentListProps = {
  projectId: string;
};

export default function DocumentList({ projectId }: DocumentListProps) {
  const [documents, setDocuments] = useState(dummyDocuments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   // Här kommer vi att hämta dokument från API:et baserat på projectId
  //   // const fetchDocuments = async () => { ... };
  //   // fetchDocuments();
  // }, [projectId]);

  if (loading) {
    return <div className="text-center p-8 text-gray-400">Laddar dokument...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-400">Kunde inte ladda dokument: {error}</div>;
  }

  return (
    <div className="border-t border-gray-700">
      {documents.length > 0 ? (
        <ul>
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center p-4 border-b border-gray-700/50 hover:bg-gray-800 transition-colors duration-150 cursor-pointer">
              <IconFileText className="w-6 h-6 mr-4 text-gray-400" />
              <div className="flex-grow">
                <p className="text-white font-medium">{doc.name}</p>
                <p className="text-sm text-gray-500">{doc.size} - Senast ändrad: {doc.lastModified}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg m-6">
            <IconFolderOpen className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">Inga dokument än</h3>
            <p className="text-gray-500">Dra och släpp filer här, eller klicka för att ladda upp.</p>
        </div>
      )}
    </div>
  );
}
