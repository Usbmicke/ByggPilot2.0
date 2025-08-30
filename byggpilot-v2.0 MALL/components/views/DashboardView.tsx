
import React from 'react';
import { Project } from '../../types';
import ProjectCard from '../dashboard/ProjectCard';
import RecentEventsWidget from '../dashboard/RecentEventsWidget';
import TodoWidget from '../dashboard/TodoWidget';

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.map(project => (
                            <ProjectCard key={project.id} project={project} showWeather={showWeather} />
                        ))}
                    </div>
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
