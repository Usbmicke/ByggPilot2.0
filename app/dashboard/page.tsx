
'use client';

import React, { Suspense } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import GuidedTour from '@/app/components/tour/GuidedTour'; // Importera touren

// En platshållarkomponent för projektlistan när den är tom
const EmptyProjectsState = () => (
  <div id="tour-step-2-projects" className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg mt-8">
    <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.68-4.33l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 7.5v10.5a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V16.5a1.5 1.5 0 00-.44-1.06l-2.12-2.12a1.5 1.5 0 00-2.12 0z" />
    </svg>
    <h3 className="mt-2 text-sm font-semibold text-white">Inga projekt än</h3>
    <p className="mt-1 text-sm text-gray-400">Kom igång genom att skapa ditt första projekt.</p>
     <div className="mt-6">
        <button
            type="button"
            className="inline-flex items-center gap-x-2 rounded-md bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            Skapa ditt första projekt
        </button>
     </div>
  </div>
);

const DashboardOverviewPage = () => {
  const projects = []; // Tom array som platshållare

  return (
    // Använd Suspense för att säkerställa att tour-parametern läses korrekt på klientsidan
    <Suspense fallback={<div>Laddar...</div>}>
        <div className="p-4 sm:p-6 lg:p-8">
        <GuidedTour />
        <div className="sm:flex sm:items-center">
            <div id="tour-step-1-welcome" className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-6 text-white">Översikt</h1>
            <p className="mt-2 text-sm text-gray-400">
                Välkommen tillbaka! Här är en snabb överblick av dina senaste aktiviteter.
            </p>
            </div>
        </div>

        {/* Här kommer vi i framtiden att visa widgets och statistik. Nu visas projektlistan. */}
        {projects.length === 0 ? (
            <EmptyProjectsState />
        ) : (
            <div className="mt-8 flow-root">
            {/* Här kommer den faktiska projektlistan att renderas */}
            </div>
        )}
        </div>
    </Suspense>
  );
};

export default DashboardOverviewPage;
