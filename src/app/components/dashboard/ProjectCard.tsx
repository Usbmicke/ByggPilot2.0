
import React from 'react';
import { Project } from '@/lib/types';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

// --- Props-interface för ProjectCard (Version 2.2) ---
// onSelect och isSelected är nu valfria för att öka komponentens återanvändbarhet.
interface ProjectCardProps {
    project: Project;
    onSelect?: () => void;
    isSelected?: boolean;
}

// --- Huvudkomponent: ProjectCard (Version 2.2) ---
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, isSelected = false }) => {

    const colorClasses = {
        green: 'border-green-500/50 hover:border-green-500 hover:shadow-green-500/10',
        yellow: 'border-yellow-500/50 hover:border-yellow-500 hover:shadow-yellow-500/10',
        red: 'border-red-500/50 hover:border-red-500 hover:shadow-red-500/10',
        gray: 'border-gray-500/50 hover:border-gray-500 hover:shadow-gray-500/10',
    };

    const progressBarColor = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500',
    };

    const lastActivityDate = new Date(project.lastActivity).toLocaleDateString('sv-SE', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // -- Anpassad logik för valt/icke-valt tillstånd --
    const selectionClasses = isSelected 
        ? `border-2 border-cyan-400 shadow-lg shadow-cyan-500/10`
        : `border backdrop-blur-sm ${colorClasses[project.statusColor]}`;

    return (
        <div 
            onClick={onSelect}
            className={`group bg-gray-800/60 rounded-xl p-5 flex flex-col justify-between h-full transition-all duration-300 ${onSelect ? 'cursor-pointer' : ''} ${selectionClasses}`}
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg transition-colors duration-300 ${isSelected ? 'text-cyan-300' : 'text-gray-100 group-hover:text-cyan-400'}`}>{project.projectName}</h3>
                    <button 
                        onClick={(e) => { e.stopPropagation(); console.log('Öppnar meny för', project.id); }} 
                        className="p-1 text-gray-500 hover:text-white rounded-full transition-colors duration-200 z-10"
                    >
                        <EllipsisHorizontalIcon className="h-6 w-6" />
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-5 truncate">{project.clientName}</p>
                
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-400 font-medium">Framsteg</p>
                    <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>{project.progress}%</p>
                </div>
                <div className="w-full bg-gray-700/80 rounded-full h-2 mb-4 overflow-hidden">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${progressBarColor[project.statusColor]}`}
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <p>Senaste aktivitet:</p>
                <p>{lastActivityDate}</p>
            </div>
        </div>
    );
};

export default ProjectCard;
