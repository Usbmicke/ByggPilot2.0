
import React from 'react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

const ProjectsPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Projekt</h1>
        <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary bg-background-secondary px-4 py-2 rounded-lg border border-border-primary transition-colors">
                <ArchiveBoxIcon className="h-5 w-5" />
                Arkiverade projekt
            </button>
        </div>
      </div>

      {/* Här kommer vi att rendera listan med projekt */}
      <div className="p-8 text-center border-2 border-dashed border-border-primary rounded-lg">
        <p className="text-text-secondary">Projektlistan är under utveckling.</p>
      </div>
    </div>
  );
};

export default ProjectsPage;
