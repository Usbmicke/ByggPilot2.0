
'use client';

import React, { useState } from 'react';
import ProjectList from '@/app/components/dashboard/ProjectList';
import CreateProjectModal from '@/app/components/modals/CreateProjectModal';
import DashboardSummary from '@/app/components/dashboard/DashboardSummary'; // IMPORTERA

export default function DashboardPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const handleProjectCreated = () => {
    setUpdateTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Dashboard Summary */}
      <DashboardSummary updateTrigger={updateTrigger} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Dina Projekt</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-accent-blue hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          + Skapa Nytt Projekt
        </button>
      </div>
      
      <ProjectList updateTrigger={updateTrigger} />

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
