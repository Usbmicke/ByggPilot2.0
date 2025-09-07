
'use client';

import React, { useState, useEffect } from 'react';
import { IconX } from '@/app/constants.tsx';
import { Project, TimeEntry } from '@/app/types';

type NewTimeEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onTimeEntryCreated: (newTimeEntry: TimeEntry) => void;
};

export default function NewTimeEntryModal({ isOpen, onClose, onTimeEntryCreated }: NewTimeEntryModalProps) {
  // Formulär-state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Sätt dagens datum som standard
  const [hours, setHours] = useState('');
  const [comment, setComment] = useState('');

  // State för att hämta projekt
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // State för formulärhantering
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effekt för att hämta projekt när modalen öppnas
  useEffect(() => {
    if (isOpen) {
      // Återställ formuläret
      setSelectedProjectId('');
      setDate(new Date().toISOString().split('T')[0]);
      setHours('');
      setComment('');
      setError(null);
      
      const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
          const response = await fetch('/api/projects/list');
          if (!response.ok) {
            throw new Error('Kunde inte hämta projektlistan');
          }
          const data: Project[] = await response.json();
          // Filtrera bort avslutade projekt
          const activeProjects = data.filter(p => p.status !== 'Avslutat');
          setProjects(activeProjects);
        } catch (err: any) {
          setError(err.message);
        }
        setIsLoadingProjects(false);
      };

      fetchProjects();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (!selectedProject || !date || !hours) {
      setError('Projekt, datum och timmar måste fyllas i.');
      setIsSubmitting(false);
      return;
    }

    const hoursNumber = parseFloat(hours);
    if (isNaN(hoursNumber) || hoursNumber <= 0) {
        setError('Antal timmar måste vara ett positivt tal.');
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch('/api/time-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          customerName: selectedProject.customerName,
          date,
          hours: hoursNumber,
          comment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Något gick fel vid spara av tidpost');
      }

      const newTimeEntry = await response.json();
      onTimeEntryCreated(newTimeEntry);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Rapportera Tid</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700/50">
            <IconX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-1">Projekt</label>
              <select id="project" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} disabled={isLoadingProjects} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50">
                <option value="">{isLoadingProjects ? 'Laddar projekt...' : 'Välj ett projekt'}</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name} ({project.customerName})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Datum</label>
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 calendar-picker-indicator-dark" />
            </div>
             <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-300 mb-1">Timmar</label>
              <input type="number" id="hours" value={hours} onChange={e => setHours(e.target.value)} placeholder="T.ex. 8" step="0.5" min="0" className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">Kommentar (valfri)</label>
              <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Beskrivning av arbetet..."></textarea>
            </div>
            {error && <p className="text-red-400 text-sm md:col-span-2">{error}</p>}
          </div>
          <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors">Avbryt</button>
            <button type="submit" disabled={isSubmitting || isLoadingProjects} className="py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Sparar...' : 'Spara Tidpost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
