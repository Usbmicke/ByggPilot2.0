'use client';

import React from 'react';
import { Document } from '@/types';
import { FolderIcon, DocumentIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface DocumentsViewProps {
  initialDocuments?: Document[];
}

const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('google-apps.folder')) {
        return <FolderIcon className="w-6 h-6 text-cyan-400" />;
    }
    // Mer specifika ikoner för GDocs, GSheets etc.
    if (mimeType.includes('google-apps.document')) {
        return <DocumentIcon className="w-6 h-6 text-blue-400" />;
    }
    if (mimeType.includes('google-apps.spreadsheet')) {
        return <DocumentIcon className="w-6 h-6 text-green-400" />;
    }
    if (mimeType.includes('pdf')) {
        return <DocumentIcon className="w-6 h-6 text-red-400" />;
    }
    return <DocumentIcon className="w-6 h-6 text-gray-400" />;
}

export default function DocumentsView({ initialDocuments = [] }: DocumentsViewProps) {
  return (
    <div className="p-4 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Projektfiler & Dokument</h2>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
             <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-700 text-gray-400 font-bold text-sm">
                <div className="col-span-6">Namn</div>
                <div className="col-span-3">Typ</div>
                <div className="col-span-3">Senast ändrad</div>
            </div>

            {initialDocuments.length === 0 ? (
                 <div className="p-8 text-center text-gray-400">
                    <h3 className="text-lg font-semibold text-white">Inga dokument</h3>
                    <p className="mt-2">Projektmappen på Google Drive är tom.</p>
                </div>
            ) : (
                initialDocuments.map(file => (
                    <a 
                      href={file.webViewLink}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      key={file.id} 
                      className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150 cursor-pointer last:border-b-0 group"
                    >
                        <div className="col-span-6 flex items-center gap-3">
                            {getFileIcon(file.mimeType)}
                            <span className="font-medium text-white truncate">{file.name}</span>
                        </div>
                        <div className="col-span-3 text-gray-400 text-sm truncate">{file.mimeType.replace('application/vnd.google-apps.', '')}</div>
                        <div className="col-span-3 text-gray-400 text-sm flex justify-between items-center">
                           <span>{new Date(file.modifiedTime).toLocaleDateString('sv-SE')}</span>
                           <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </a>
                ))
            )}
        </div>
    </div>
  );
}
