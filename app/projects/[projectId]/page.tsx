'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/app/types';
import DocumentList from '@/app/components/DocumentList';
import { IconBrandGoogle, IconLoader } from '@/app/constants';

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Funktion för att starta Google Auth-flödet
  const handleConnectGoogleDrive = async () => {
    setIsAuthLoading(true);
    try {
      const response = await fetch('/api/auth/google-auth-url');
      if (!response.ok) {
        throw new Error('Kunde inte hämta Googles autentiserings-URL.');
      }
      const { url } = await response.json();
      // Omdirigera användaren till Googles samtyckesskärm
      window.location.href = url;
    } catch (err) {
        if(err instanceof Error) {
            setError(err.message);
        } else {
            setError("Ett okänt fel uppstod.")
        }
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!params.projectId) return;

    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${params.projectId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProject(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        }
         else {
            setError('An unknown error occurred while fetching project details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [params.projectId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Laddar projektdetaljer...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">Kunde inte ladda projektet: {error}</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-gray-400">Projektet kunde inte hittas.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">{project.name}</h1>
          <p className="text-lg text-gray-400">{project.customerName}</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Dokument</h2>
        </div>

        {/* Beroende på om projektet är kopplat, visa dokumentlistan eller en uppmaning */}
        {project.driveFolderId ? (
            <DocumentList projectId={params.projectId} />
        ) : (
            <div className="text-center p-12 border-t border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-2">Koppla till Google Drive</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">För att hantera dokument för detta projekt behöver du koppla ditt Google Drive-konto till ByggPilot.</p>
                <button 
                    onClick={handleConnectGoogleDrive}
                    disabled={isAuthLoading}
                    className="inline-flex items-center justify-center px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200">
                    {isAuthLoading ? (
                        <>
                            <IconLoader className="animate-spin w-5 h-5 mr-3" />
                            Omdirigerar...
                        </>
                    ) : (
                        <>
                            <IconBrandGoogle className="w-5 h-5 mr-3" />
                            Anslut Google Drive
                        </>
                    )}
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
