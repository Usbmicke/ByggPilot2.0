
'use client';

import React, { useState, useEffect } from 'react';
import { PlayIcon, StopIcon, MapIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

// Dummy-data för projekt. Detta kommer att ersättas med ett API-anrop.
const projects = [
  { id: '1', name: 'Altanbygge Andersson' },
  { id: '2', name: 'Badrum Total' },
  { id: '3', name: 'Villa Eklund' },
];

const ActivityLoggerWidget = () => {
  const [isTiming, setIsTiming] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerType, setTimerType] = useState<'time' | 'travel' | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTiming) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isTiming && elapsedTime !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTiming]);

  const handleStart = (type: 'time' | 'travel') => {
    setTimerType(type);
    setElapsedTime(0);
    setIsTiming(true);
  };

  const handleStop = () => {
    setIsTiming(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="bg-background-secondary p-4 rounded-lg border border-border-primary shadow-sm">
      <h3 className="font-bold text-text-primary text-lg mb-4">Aktivitetslogg</h3>

      {isTiming ? (
        <div className="space-y-3 animate-fade-in">
          <div>
            <p className='text-sm text-text-secondary'>Loggar {timerType === 'time' ? 'arbetstid' : 'resa'} för:</p>
            <p className='font-semibold text-text-primary truncate'>Altanbygge Andersson</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-3xl font-mono text-accent-blue tracking-wider tabular-nums">{formatTime(elapsedTime)}</div>
            <button 
                onClick={handleStop}
                className="flex items-center justify-center gap-2 bg-red-600/10 text-red-400 font-semibold px-4 py-2 rounded-lg hover:bg-red-600/20 transition-colors duration-200">
                <StopIcon className="h-5 w-5" />
                <span>Stoppa</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="project-select" className="block text-sm font-medium text-text-secondary mb-1">Projekt</label>
            <select id="project-select" className="appearance-none w-full bg-background-tertiary border border-border-primary rounded-md py-2 pl-3 pr-10 text-text-primary focus:ring-1 focus:ring-accent-blue focus:border-accent-blue">
              <option>Välj ett pågående projekt...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-[38px] h-5 w-5 text-text-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => handleStart('time')}
                className="flex items-center justify-center gap-2 bg-accent-blue/10 text-accent-blue font-semibold py-2 rounded-lg hover:bg-accent-blue/20 transition-colors duration-200">
                <PlayIcon className="h-5 w-5" />
                <span>Tid</span>
            </button>
            <button 
                onClick={() => handleStart('travel')}
                className="flex items-center justify-center gap-2 bg-gray-600/10 text-text-secondary font-semibold py-2 rounded-lg hover:bg-gray-600/20 transition-colors duration-200">
                <MapIcon className="h-5 w-5" />
                <span>Resa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLoggerWidget;
