'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, DocumentCheckIcon, XCircleIcon } from '@heroicons/react/24/solid';

enum UploadStatus {
    IDLE,
    UPLOADING,
    SUCCESS,
    ERROR
}

interface FileUploadProps {
    projectId: string;
    onUploadComplete: () => void; // Funktion för att meddela föräldern att listan ska uppdateras
}

export default function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
    const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setStatus(UploadStatus.UPLOADING);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);

        try {
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Något gick fel under uppladdningen.');
            }

            setStatus(UploadStatus.SUCCESS);
            onUploadComplete(); // Meddela att en ny fil finns
            setTimeout(() => setStatus(UploadStatus.IDLE), 3000); // Återställ efter 3 sek

        } catch (error: any) {
            setStatus(UploadStatus.ERROR);
            setErrorMessage(error.message || 'Ett okänt fel inträffade.');
        }
    }, [projectId, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        multiple: false, // Tillåt bara en fil åt gången för enkelhetens skull
        // accect: Lägg till filtypsvalidering här vid behov
    });

    const getBorderColor = () => {
        if (isDragAccept) return 'border-green-500';
        if (isDragReject) return 'border-red-500';
        if (isDragActive) return 'border-cyan-500';
        return 'border-gray-600';
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`relative flex flex-col items-center justify-center w-full h-48 p-6 border-2 border-dashed ${getBorderColor()} rounded-xl cursor-pointer transition-colors duration-200 ease-in-out bg-gray-800/50 hover:bg-gray-700/50`}
            >
                <input {...getInputProps()} />
                
                {status === UploadStatus.UPLOADING && (
                     <div className="text-center">
                        <p className="text-lg text-yellow-300">Laddar upp...</p>
                        <p className="text-sm text-gray-400">Vänta medan filen överförs.</p>
                    </div>
                )}

                {status === UploadStatus.SUCCESS && (
                     <div className="text-center text-green-400">
                        <DocumentCheckIcon className="w-16 h-16 mx-auto"/>
                        <p className="text-lg font-semibold">Klart!</p>
                        <p className="text-sm">Filen har laddats upp.</p>
                    </div>
                )}

                 {status === UploadStatus.ERROR && (
                     <div className="text-center text-red-400">
                        <XCircleIcon className="w-16 h-16 mx-auto"/>
                        <p className="text-lg font-semibold">Fel</p>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}

                {status === UploadStatus.IDLE && (
                    <div className="text-center text-gray-400 pointer-events-none">
                        <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                        <h3 className="text-lg font-semibold">Dra och släpp en fil här</h3>
                        <p className="text-sm">eller klicka för att välja en fil</p>
                        <p className="text-xs text-gray-600 mt-4">Max 1 fil åt gången</p>
                    </div>
                )}
            </div>
        </div>
    );
}
