
'use client';
import React, { useState, useEffect } from 'react';
import { FolderIcon, DocumentIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
}

interface ProjectDetailViewProps {
  projectName: string;
  folderId: string;
  onBack: () => void;
}

const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('google-apps.folder')) {
        return <FolderIcon className="w-6 h-6 text-cyan-400" />;
    }
    if (mimeType.includes('google-apps.document')) {
        return <DocumentIcon className="w-6 h-6 text-blue-400" />;
    }
    if (mimeType.includes('google-apps.spreadsheet')) {
        return <DocumentIcon className="w-6 h-6 text-green-400" />;
    }
    return <DocumentIcon className="w-6 h-6 text-gray-400" />;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectName, folderId, onBack }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (folderId) {
      const fetchFiles = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/google/drive/list-project-files?folderId=${folderId}`);
          if (!response.ok) {
            throw new Error('Kunde inte ladda projektfiler.');
          }
          const data = await response.json();
          setFiles(data.files || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchFiles();
    }
  }, [folderId]);

  return (
    <div className="animate-fade-in">
        <div className="flex items-center mb-6">
            <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-gray-700/50 transition-colors">
                <ArrowUturnLeftIcon className="w-6 h-6 text-gray-300"/>
            </button>
            <h1 className="text-3xl font-bold text-white truncate">{projectName}</h1>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 text-gray-400 font-bold text-sm">
                <div className="col-span-6">Namn</div>
                <div className="col-span-3">Typ</div>
                <div className="col-span-3">Senast ändrad</div>
            </div>

            {isLoading && <div className="p-4 text-center text-gray-400">Laddar filer...</div>}
            {error && <div className="p-4 text-center text-red-400">Fel: {error}</div>}
            {!isLoading && !error && files.length === 0 && (
                 <div className="p-8 text-center text-gray-400">
                    <h3 className="text-lg font-semibold text-white">Tomt projekt</h3>
                    <p className="mt-2">Den här projektmappen innehåller inga filer än.</p>
                </div>
            )}

            {!isLoading && !error && files.map(file => (
                <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" key={file.id} className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150 cursor-pointer last:border-b-0">
                    <div className="col-span-6 flex items-center gap-3">
                        {getFileIcon(file.mimeType)}
                        <span className="font-medium text-white truncate">{file.name}</span>
                    </div>
                    <div className="col-span-3 text-gray-400 text-sm truncate">{file.mimeType.replace('application/vnd.google-apps.', '')}</div>
                    <div className="col-span-3 text-gray-400 text-sm">{new Date(file.modifiedTime).toLocaleDateString('sv-SE')}</div>
                </a>
            ))}
        </div>
    </div>
  );
};

export default ProjectDetailView;
