
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Project } from '@/app/types/project';
import { IconPlayerPlay, IconPlayerStop } from '@/app/constants';

const formatDuration = (ms: number) => {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function TimeLogger() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [activeTimer, setActiveTimer] = useState<{ logId: string; projectId: string; startTime: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Hämta projekt och aktiv timer samtidigt för snabbare laddning
        const [projectsRes, activeTimerRes] = await Promise.all([
          fetch('/api/projects/list'),
          fetch('/api/timelog/active')
        ]);

        if (!projectsRes.ok) throw new Error('Kunde inte hämta projekt.');
        const projectsData = await projectsRes.json();
        const fetchedProjects = projectsData.projects || [];
        setProjects(fetchedProjects);

        if (!activeTimerRes.ok) throw new Error('Kunde inte verifiera timerstatus.');
        const timerData = await activeTimerRes.json();
        
        if (timerData.activeTimer) {
          setActiveTimer(timerData.activeTimer);
        } else if (fetchedProjects.length > 0) {
          // Om ingen timer är aktiv, välj det första projektet i listan som standard
          setSelectedProject(fetchedProjects[0].id);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - activeTimer.startTime);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStart = async () => {
    if (!selectedProject) {
      setError('Välj ett projekt först.');
      return;
    }
    setError(null);
    try {
      const response = await fetch('/api/timelog/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProject }),
      });
      if (!response.ok) throw new Error('Kunde inte starta timern.');
      const data = await response.json();
      setActiveTimer({ ...data, projectId: selectedProject, startTime: data.startTime });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStop = async () => {
    if (!activeTimer) return;
    try {
      const response = await fetch('/api/timelog/manage', {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Kunde inte stoppa timern.');
      // Välj det senast loggade projektet som standard i dropdownen
      setSelectedProject(activeTimer.projectId);
      setActiveTimer(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getProjectName = (projectId: string) => {
      return projects.find(p => p.id === projectId)?.projectName || 'Okänt Projekt';
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <h2 className="text-xl font-bold text-white mb-4">Tidsloggning</h2>
      
      {isLoading ? (
        <div className="text-center text-gray-400 p-8">Synkroniserar...</div>
      ) : error ? (
        <div className="text-center text-red-400 p-8">{error}</div>
      ) : activeTimer ? (
        <div className="space-y-4 animate-fade-in-fast">
          <div className="text-center">
            <p className="text-sm text-gray-400">Pågående på projekt:</p>
            <p className="font-semibold text-white truncate">{getProjectName(activeTimer.projectId)}</p>
          </div>
          <div className="font-mono text-4xl text-center text-white bg-gray-900/50 rounded-lg py-2">
            {formatDuration(elapsedTime)}
          </div>
          <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors">
            <IconPlayerStop className="w-6 h-6" />
            Stoppa Tid
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <select 
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
            disabled={projects.length === 0}
          >
            {projects.length > 0 ? (
              projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)
            ) : (
              <option>Skapa ett projekt för att logga tid</option>
            )}
          </select>
          <button onClick={handleStart} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={projects.length === 0}>
            <IconPlayerPlay className="w-6 h-6" />
            Starta Tid
          </button>
        </div>
      )}
    </div>
  );
}
