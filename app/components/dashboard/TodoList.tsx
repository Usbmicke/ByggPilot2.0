
'use client';

import React, { useState, useEffect } from 'react';
import { IconChevronDown, IconChevronUp, IconCheckCircle, IconCircle } from '@/app/constants';

interface Task {
  id: string;
  title: string;
  notes: string | null;
}

// Enskild uppgifts-komponent
const TaskItem = ({ task, onToggleComplete }: { task: Task, onToggleComplete: (id: string) => void }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleToggle = () => {
    setIsCompleted(!isCompleted);
    // Notering: `onToggleComplete` anropas här för framtida integration.
    // Just nu hanterar vi bara det visuella tillståndet.
    setTimeout(() => onToggleComplete(task.id), 300); 
  };

  return (
    <li className={`flex items-center gap-3 p-3 transition-all duration-300 ${isCompleted ? 'opacity-40' : 'opacity-100'}`}>
      <button onClick={handleToggle} className="flex-shrink-0">
        {isCompleted ? 
          <IconCheckCircle className="w-6 h-6 text-green-400" /> : 
          <IconCircle className="w-6 h-6 text-gray-500 hover:text-cyan-400 transition-colors" />
        }
      </button>
      <div className="flex-grow">
        <p className={`font-medium text-white ${isCompleted ? 'line-through' : ''}`}>{task.title}</p>
        {task.notes && <p className={`text-sm text-gray-400 ${isCompleted ? 'line-through' : ''}`}>{task.notes}</p>}
      </div>
    </li>
  );
};

// Huvudkomponenten för "Att Göra"-listan
export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true); // Styr synligheten

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/google/tasks/list-tasks');
        if (!response.ok) {
          throw new Error('Kunde inte ansluta till Google Tasks.');
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

  const handleTaskCompleted = (taskId: string) => {
    // Funktion för att ta bort en uppgift från listan visuellt när den markeras som klar
    setTimeout(() => {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    }, 500); // liten fördröjning för att animationen ska hinna visas
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
          {loading && <p className="p-4 text-gray-400">Laddar uppgifter...</p>}
          {error && <p className="p-4 text-red-400">{`Fel: ${error}`}</p>}
          {!loading && !error && (
            tasks.length > 0 ? (
              <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {tasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggleComplete={handleTaskCompleted} />
                ))}
              </ul>
            ) : (
              <p className="p-4 text-gray-400">Du har inga aktiva uppgifter. Bra jobbat!</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
