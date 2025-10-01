
'use client';

import React, { useState, useEffect } from 'react';
import { PlayIcon, StopIcon, MapIcon } from '@heroicons/react/24/solid';

// Dummy-data för projekt. Detta kommer att ersättas med ett API-anrop.
const projects = [
  { id: '1', name: 'Altanbygge Andersson' },
  { id: '2', name: 'Badrum Total' },
  { id: '3', name: 'Villa Eklund' },
];

const TimeLoggerWidget = () => {
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
  }, [isTiming, elapsedTime]);

  const handleStart = (type: 'time' | 'travel') => {
    // I en framtida version skulle ett API-anrop göras här för att starta timern i backend.
    alert(`Startar ${type === 'time' ? 'tidtagning' : 'resa'}. API-anrop simulerat.`);
    setTimerType(type);
    setElapsedTime(0);
    setIsTiming(true);
  };

  const handleStop = () => {
    // I en framtida version skulle ett API-anrop göras här för att stoppa och spara tiden.
    alert(`Stoppar timer. Total tid: ${formatTime(elapsedTime)}. API-anrop simulerat.`);
    setIsTiming(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="bg-background-secondary p-6 rounded-lg shadow-md border border-border-primary">
      <h3 className="font-bold text-text-primary text-lg mb-4">Snabb-logg</h3>

      {isTiming ? (
        <div className="text-center">
            <p className='text-text-secondary mb-2'>Loggar {timerType === 'time' ? 'arbetstid' : 'resa'} för projekt:</p>
            <p className='font-semibold text-text-primary mb-3'>Altanbygge Andersson</p>
            <div className="text-5xl font-mono text-accent-blue mb-4 tracking-wider">{formatTime(elapsedTime)}</div>
            <button 
                onClick={handleStop}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg transform hover:scale-105">
                <StopIcon className="h-6 w-6" />
                <span>Stoppa</span>
            </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="project-select" className="block text-sm font-medium text-text-secondary mb-1">Välj projekt</label>
            <select id="project-select" className="w-full bg-background-tertiary border border-border-primary rounded-md p-2 text-text-primary focus:ring-accent-blue focus:border-accent-blue">
              <option>Välj ett pågående projekt...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
                onClick={() => handleStart('time')}
                className="flex items-center justify-center gap-2 bg-accent-blue text-white font-semibold py-3 rounded-lg hover:bg-accent-blue-dark transition-colors duration-200 shadow transform hover:scale-105">
                <PlayIcon className="h-5 w-5" />
                <span>Starta Tidtagning</span>
            </button>
            <button 
                onClick={() => handleStart('travel')}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow transform hover:scale-105">
                <MapIcon className="h-5 w-5" />
                <span>Starta Resa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeLoggerWidget;
