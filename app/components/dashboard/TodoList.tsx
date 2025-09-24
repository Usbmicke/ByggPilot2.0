
'use client';

import React, { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronUp, IconCheckCircle, IconCircle } from '@/app/constants';

// CSS-klasser för animationen när en uppgift tas bort
const taskDisappearAnimation = 'transition-all duration-500 ease-out opacity-0 scale-95';

interface Task {
  id: string;
  title: string;
  notes: string | null;
  isCompleting?: boolean; // Nytt state för att styra animationen
}

// Enskild uppgifts-komponent (förenklad)
const TaskItem = ({ task, onComplete }: { task: Task, onComplete: (id: string) => void }) => {
  return (
    <li 
      className={`flex items-center gap-3 p-3 duration-300 ${task.isCompleting ? taskDisappearAnimation : 'opacity-100 scale-100'}`}>
      <button onClick={() => onComplete(task.id)} className="flex-shrink-0" disabled={task.isCompleting}>
        {task.isCompleting ? 
          <IconCheckCircle className="w-6 h-6 text-green-400" /> : 
          <IconCircle className="w-6 h-6 text-gray-500 hover:text-cyan-400 transition-colors" />
        }
      </button>
      <div className={`flex-grow transition-opacity duration-300 ${task.isCompleting ? 'opacity-40' : 'opacity-100'}`}>
        <p className={`font-medium text-white ${task.isCompleting ? 'line-through' : ''}`}>{task.title}</p>
        {task.notes && <p className={`text-sm text-gray-400 ${task.isCompleting ? 'line-through' : ''}`}>{task.notes}</p>}
      </div>
    </li>
  );
};

// Huvudkomponenten för "Att Göra"-listan (förbättrad logik)
export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/google/tasks/list-tasks');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Nätverksfel vid hämtning av uppgifter.');
        }
        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskComplete = (taskId: string) => {
    // Steg 1: Markera uppgiften som `isCompleting` för att starta animationen
    setTasks(prevTasks => 
      prevTasks.map(t => t.id === taskId ? { ...t, isCompleting: true } : t)
    );

    // Steg 2: Efter att animationen har spelats klart, ta bort uppgiften från listan
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    }, 500); // Tiden ska matcha CSS-animationens längd
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Att Göra (från Google Tasks)</h2>
        <button onClick={() => setIsVisible(!isVisible)} className="p-2 rounded-full hover:bg-gray-700/50">
          {isVisible ? <IconChevronUp className="w-6 h-6 text-gray-400" /> : <IconChevronDown className="w-6 h-6 text-gray-400" />}
        </button>
      </div>

      {isVisible && (
        <div className="animate-fade-in-fast">
          {loading && <p className="p-4 text-gray-400 text-center">Laddar uppgifter...</p>}
          {error && <p className="p-4 text-red-400 text-center">{`Fel: ${error}`}</p>}
          {!loading && !error && (
            tasks.length > 0 ? (
              <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {tasks.map(task => (
                  <TaskItem key={task.id} task={task} onComplete={handleTaskComplete} />
                ))}
              </ul>
            ) : (
              <p className="p-4 text-gray-400 text-center">Du har inga aktiva uppgifter. Bra jobbat!</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
