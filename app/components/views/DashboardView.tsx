'use client';
import React from 'react';
import { Project } from '@/app/types';
import ProjectCard from '@/app/components/dashboard/ProjectCard';
import RecentEventsWidget from '@/app/components/dashboard/RecentEventsWidget';
import TodoWidget from '@/app/components/dashboard/TodoWidget';

interface DashboardViewProps {
    projects: Project[];
    showWeather: boolean;
    showTodo: boolean;
}

const DashboardView: React.FC<DashboardViewProps> = ({ projects, showWeather, showTodo }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Mina Projekt</h2>
                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map(project => (
                                <ProjectCard key={project.id} project={project} showWeather={showWeather} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                            <h3 className="text-xl font-bold text-white">Välkommen till ByggPilot!</h3>
                            <p className="text-gray-400 mt-2">Du har inga aktiva projekt just nu.</p>
                            <p className="text-gray-400 mt-1">Klicka på "Nytt Projekt" i menyn för att komma igång.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
                <RecentEventsWidget />
                {showTodo && <TodoWidget />}
            </div>
        </div>
    );
};

export default DashboardView;
