
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IconPlus } from '@/app/constants';
import NewTimeEntryModal from '@/app/components/NewTimeEntryModal';
import { TimeEntry, Project } from '@/app/types';

const TimeEntryRow: React.FC<{ entry: TimeEntry }> = ({ entry }) => (
    <div className="grid grid-cols-4 gap-4 items-center p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200 last:border-b-0">
        <div className="col-span-2">
            <p className="font-semibold text-white">{entry.projectName}</p>
            <p className="text-sm text-gray-400">{entry.customerName}</p>
        </div>
        <div className="text-center">
            <p className="text-white">{entry.hours} tim</p>
            <p className="text-sm text-gray-400">{new Date(entry.date).toLocaleDateString('sv-SE')}</p>
        </div>
        <div className="text-left text-gray-300 truncate">
            <p className='italic'>{entry.comment || "-"}</p>
        </div>
    </div>
);

export default function TimeReportingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Hämta både tidsposter och projekt samtidigt
        const [timeEntriesRes, projectsRes] = await Promise.all([
          fetch('/api/time-entries/list'),
          fetch('/api/projects/list')
        ]);

        if (!timeEntriesRes.ok) throw new Error('Kunde inte ladda tidsposter.');
        if (!projectsRes.ok) throw new Error('Kunde inte ladda projekt.');

        const timeEntriesData: TimeEntry[] = await timeEntriesRes.json();
        const projectsData: Project[] = await projectsRes.json();

        setTimeEntries(timeEntriesData);
        setProjects(projectsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTimeEntryCreated = (newTimeEntry: TimeEntry) => {
    setTimeEntries(prevEntries => 
      [newTimeEntry, ...prevEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  // Filtrera tidsposter baserat på valt projekt
  const filteredTimeEntries = useMemo(() => {
    if (selectedProjectFilter === 'all') {
      return timeEntries;
    }
    return timeEntries.filter(entry => entry.projectId === selectedProjectFilter);
  }, [timeEntries, selectedProjectFilter]);


  const renderContent = () => {
    if (isLoading) {
      return <div className="p-8 text-center text-gray-400">Laddar tidsposter...</div>;
    }
    if (error) {
      return <div className="p-8 text-center text-red-400">Fel: {error}</div>;
    }
    if (filteredTimeEntries.length > 0) {
      return filteredTimeEntries.map(entry => <TimeEntryRow key={entry.id} entry={entry} />);
    }
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Inga tidsposter matchade ditt filter.</p>
        <p className="text-sm mt-1">Prova att välja ett annat projekt eller rapportera en ny tidpost.</p>
      </div>
    );
  };

  return (
    <>
      <NewTimeEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTimeEntryCreated={handleTimeEntryCreated}
      />
      <div className="p-4 md:p-8">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Tidrapportering</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            <IconPlus className="w-5 h-5" />
            <span>Rapportera Tid</span>
          </button>
        </header>

        {/* Filter-sektion */}
        <div className="mb-6 flex items-center gap-4">
            <label htmlFor="projectFilter" className="text-sm font-medium text-gray-300">Filtrera per projekt:</label>
            <select 
                id="projectFilter"
                value={selectedProjectFilter}
                onChange={e => setSelectedProjectFilter(e.target.value)}
                className="bg-gray-700 border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                disabled={isLoading || projects.length === 0}
            >
                <option value="all">Alla projekt</option>
                {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-700 font-semibold text-gray-400 text-sm">
              <div className="col-span-2">Projekt</div>
              <div className="text-center">Tid & Datum</div>
              <div>Kommentar</div>
          </div>
          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
