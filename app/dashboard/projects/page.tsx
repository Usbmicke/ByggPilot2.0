
'use client';

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

// Denna komponent representerar huvudsidan för projekthantering.
// Den har en ren layout för att ge en tydlig överblick.

const ProjectsPage = () => {
  // TODO: Här kommer logik för att hämta och visa en lista med projekt.
  const projects = []; // Tom array som platshållare

  const handleAddNewProject = () => {
    // TODO: Denna funktion kommer att öppna en modal för att skapa ett nytt projekt.
    alert('Öppnar modal för att skapa nytt projekt...');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-text-primary">Projekt</h1>
          <p className="mt-2 text-sm text-text-secondary">
            En lista över alla dina pågående och avslutade projekt.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleAddNewProject}
            className="inline-flex items-center gap-x-2 rounded-md bg-accent-blue px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-blue-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            Nytt Projekt
          </button>
        </div>
      </div>

      {/* Platshållare för när projektlistan är tom */}
      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border-primary rounded-lg mt-8">
           <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.68-4.33l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 7.5v10.5a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V16.5a1.5 1.5 0 00-.44-1.06l-2.12-2.12a1.5 1.5 0 00-2.12 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-text-primary">Inga projekt</h3>
            <p className="mt-1 text-sm text-text-secondary">Kom igång genom att skapa ditt första projekt.</p>
        </div>
      ) : (
        // TODO: Här renderas själva listan/tabellen med projekt när det finns data.
        <div className="mt-8 flow-root">
          {/* Tabell-layout kommer här */}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
