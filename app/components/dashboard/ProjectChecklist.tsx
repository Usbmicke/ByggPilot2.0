'use client';

import { useState } from 'react';
import { FiCheckSquare, FiPlus, FiSquare } from 'react-icons/fi';
import { useProjects, useTasks } from '@/app/hooks/useApi';
import { Task } from '@/app/types';

export default function ProjectChecklist() {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [newTaskText, setNewTaskText] = useState('');

    // Hämta projektlistan och välj det första projektet som standard
    const { projects, isLoading: isLoadingProjects } = useProjects();
    if (projects && projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projects[0].id);
    }

    // Hämta uppgifter för det valda projektet
    const { tasks, isLoading: isLoadingTasks, isError: isTasksError, mutate: mutateTasks } = useTasks(selectedProjectId);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim() || !selectedProjectId) return;

        const tempId = Date.now().toString();
        const newTask: Task = { id: tempId, text: newTaskText, completed: false, projectId: selectedProjectId };

        // Optimistisk UI-uppdatering med SWR:s mutate-funktion
        await mutateTasks(async (currentTasks: any) => {
            const existingTasks = currentTasks?.tasks || [];
            return { ...currentTasks, tasks: [...existingTasks, newTask] };
        }, false); // `false` betyder att vi inte ska re-validera direkt

        setNewTaskText('');

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newTaskText, projectId: selectedProjectId }),
            });

            if (!response.ok) throw new Error('Kunde inte spara uppgift.');
            
            // När anropet lyckats, trigga en re-validering för att få den korrekta datan från servern
            await mutateTasks();

        } catch (error) {
            console.error("Fel vid skapande av uppgift:", error);
            // Vid fel, återställ till föregående tillstånd
             await mutateTasks();
        }
    };

    const isLoading = isLoadingProjects || (selectedProjectId && isLoadingTasks);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border h-full flex flex-col">
            <h2 className="font-bold text-xl mb-4">Checklista</h2>
            
            <div className="mb-4">
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-1">Välj Projekt</label>
                <select 
                    id="project-select"
                    value={selectedProjectId || ''}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                    disabled={!projects || projects.length === 0}
                >
                    {projects && projects.length > 0 ? (
                        projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                    ) : (
                        <option>Inga projekt att välja</option>
                    )}
                </select>
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                {isLoading && <p className="text-gray-500">Laddar uppgifter...</p>}
                {isTasksError && <p className="text-red-500">Kunde inte ladda checklistan.</p>}
                {!isLoading && !isTasksError && projects && projects.length > 0 && tasks && tasks.length === 0 && (
                     <p className="text-gray-500 text-center mt-4">Inga uppgifter för detta projekt. Lägg till en nedan för att komma igång!</p>
                )}
                 {!isLoading && !isTasksError && (!projects || projects.length === 0) && (
                    <p className="text-gray-500 text-center mt-4">Skapa ett projekt för att kunna lägga till uppgifter.</p>
                )}
                {tasks && tasks.map(task => (
                    <div key={task.id} className="flex items-center group">
                         <button 
                            className="mr-3 text-2xl text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            {task.completed ? <FiCheckSquare className="text-blue-600" /> : <FiSquare />}
                        </button>
                        <span className={`flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.text}
                        </span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAddTask} className="mt-6 flex items-center">
                <input 
                    type="text"
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    placeholder={selectedProjectId ? "Ny uppgift..." : "Välj ett projekt först"}
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                    disabled={!selectedProjectId || !projects || projects.length === 0}
                />
                <button type="submit" className="p-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors" disabled={!selectedProjectId || !projects || projects.length === 0 || !newTaskText.trim()}>
                    <FiPlus />
                </button>
            </form>
        </div>
    );
}
