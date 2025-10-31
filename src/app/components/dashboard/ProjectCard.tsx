
import React from 'react';
import { Project } from '@/lib/dal/projects'; // Importerar den nya, korrekta datatypen
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// --- Huvudkomponent: ProjectCard (Version 2.0) ---
// Helt ombyggd för att använda den nya datastrukturen från DAL och 
// för att inkludera de visuella förbättringarna.

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {

    // Definierar färgerna baserat på statusColor från DAL.
    // TailwindCSS kan inte använda dynamiska strängar, så vi mappar dem här.
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

    return (
        <Link href={`/dashboard/projects/${project.id}`} passHref>
            <div className={`group bg-gray-800/60 rounded-xl p-5 flex flex-col justify-between h-full border backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg ${colorClasses[project.statusColor]}`}>
                <div>
                    {/* Kortets header: Titel och Meny-ikon */}
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-100 transition-colors duration-300 group-hover:text-cyan-400">{project.projectName}</h3>
                        <button 
                            onClick={(e) => { e.preventDefault(); console.log('Öppnar meny för', project.id); }} 
                            className="p-1 text-gray-500 hover:text-white rounded-full transition-colors duration-200 z-10"
                        >
                            <EllipsisHorizontalIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-5 truncate">{project.clientName}</p>
                    
                    {/* Status-sektion */}
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-gray-400 font-medium">Framsteg</p>
                        <p className="text-sm font-bold text-gray-200">{project.progress}%</p>
                    </div>
                    <div className="w-full bg-gray-700/80 rounded-full h-2 mb-4 overflow-hidden">
                        <div 
                            className={`h-2 rounded-full transition-all duration-500 ease-out ${progressBarColor[project.statusColor]}`}
                            style={{ width: `${project.progress}%` }}
                        ></div>
                    </div>
                </div>
                
                {/* Kortets footer: Senaste aktivitet */}
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                    <p>Senaste aktivitet:</p>
                    <p>{lastActivityDate}</p>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
