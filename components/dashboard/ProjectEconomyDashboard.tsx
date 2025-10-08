
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TimeEntry } from '@/app/types/time';
import { MaterialCost } from '@/app/types/material';
import { Project } from '@/app/types/project';
import AddMaterialCostModal from '@/app/components/modals/AddMaterialCostModal';

interface ProjectEconomyDashboardProps {
  project: Project;
  onMaterialAdded: () => void; // ACCEPTERA PROP
}

export default function ProjectEconomyDashboard({ project, onMaterialAdded }: ProjectEconomyDashboardProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [materialCosts, setMaterialCosts] = useState<MaterialCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const timeResponse = await fetch(`/api/time-entries?projectId=${project.id}`);
      if (!timeResponse.ok) throw new Error('Kunde inte hämta tidrapporter.');
      const timeData = await timeResponse.json();
      setTimeEntries(timeData);

      const materialResponse = await fetch(`/api/materials?projectId=${project.id}`);
      if (!materialResponse.ok) throw new Error('Kunde inte hämta materialkostnader.');
      const materialData = await materialResponse.json();
      setMaterialCosts(materialData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMaterialAdded = () => {
    fetchData(); // Hämta data på nytt
    onMaterialAdded(); // Anropa förälderns callback
  };

  const totalHours = timeEntries.reduce((acc, entry) => acc + entry.hours, 0);
  const totalLaborCost = totalHours * project.hourlyRate;
  const totalMaterialCost = materialCosts.reduce((acc, cost) => acc + cost.amount, 0);
  const totalProjectCost = totalLaborCost + totalMaterialCost;

  if (isLoading) {
    return <p className="text-center text-gray-400 py-8">Laddar ekonomidata...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>;
  }

  return (
    <>
      <AddMaterialCostModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        projectId={project.id}
        onMaterialAdded={handleMaterialAdded}
      />

      <div className="mt-8 bg-gray-800/80 p-6 rounded-lg border border-gray-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Projektets Ekonomi (Faktiska kostnader)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400">Arbetskostnad</h3>
              <p className="text-3xl font-bold text-white mt-2">{totalLaborCost.toFixed(2)} kr</p>
            </div>
            <p className="text-sm text-gray-400 mt-2">{totalHours} timmar à {project.hourlyRate} kr/tim</p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">Materialkostnad</h3>
              <p className="text-3xl font-bold text-white mt-2">{totalMaterialCost.toFixed(2)} kr</p>
            </div>
            <button 
              onClick={() => setModalOpen(true)}
              className="mt-3 text-sm bg-yellow-600/50 hover:bg-yellow-500/50 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full"
            >
              + Lägg till Material
            </button>
          </div>

          <div className="bg-green-900/50 p-4 rounded-lg border-2 border-green-500/50 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-green-400 text-center">Total Projektkostnad</h3>
            <p className="text-4xl font-extrabold text-white text-center mt-2">{totalProjectCost.toFixed(2)} kr</p>
          </div>
        </div>
      </div>
    </>
  );
}
