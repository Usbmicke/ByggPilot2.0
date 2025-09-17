'use client';

import React from 'react';

/**
 * "Zero State"-komponent som visas när onboardingen är klar men inga projekt ännu har skapats.
 * Syftet är att välkomna användaren och ge en tydlig uppmaning (Call to Action) 
 * för att starta sitt första projekt.
 */
const ProjectOverview = () => {
  const handleCreateFirstProject = () => {
    // Denna funktion kommer i framtiden att öppna en modal eller navigera
    // till en ny sida för att skapa ett projekt.
    alert('Funktionalitet för att skapa projekt kommer snart!');
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-green-400">Välkommen till din nya projektöversikt!</h2>
      <p className="text-gray-300 mb-8 text-lg">
        All din onboarding är slutförd och du är redo att sätta igång. Låt oss skapa ditt första projekt.
      </p>
      
      <div className="mt-6 p-10 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center">
        <p className="text-gray-400 mb-6">Du har inga aktiva projekt än.</p>
        <button 
            onClick={handleCreateFirstProject}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg"
        >
            + Skapa ditt första projekt
        </button>
      </div>
    </div>
  );
};

export default ProjectOverview;
