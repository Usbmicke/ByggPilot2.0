
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectStatus } from '@/app/types';
import { IconUser, IconMoreHorizontal } from '@/app/constants';
import WeatherForecast from './WeatherForecast'; // <-- STEG 1: Importera den nya komponenten

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<string, { bg: string; text: string; progress: string }> = {
    [ProjectStatus.QUOTE]: { bg: 'bg-blue-400/20', text: 'text-blue-300', progress: 'bg-blue-400' },
    [ProjectStatus.PLANNING]: { bg: 'bg-yellow-400/20', text: 'text-yellow-300', progress: 'bg-yellow-400' },
    [ProjectStatus.ONGOING]: { bg: 'bg-cyan-400/20', text: 'text-cyan-300', progress: 'bg-cyan-400' },
    [ProjectStatus.COMPLETED]: { bg: 'bg-green-400/20', text: 'text-green-300', progress: 'bg-green-400' },
    [ProjectStatus.INVOICED]: { bg: 'bg-purple-400/20', text: 'text-purple-300', progress: 'bg-purple-400' },
};

const cardBaseStyle = "bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10";

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const color = statusColors[project.status] || { bg: 'bg-gray-500/20', text: 'text-gray-300', progress: 'bg-gray-400' };
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div className={cardBaseStyle}>
            <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg text-gray-100 flex-1">{project.name}</h3>
                     <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color.bg} ${color.text} whitespace-nowrap`}>
                            {project.status}
                        </span>
                        <div className="relative" ref={menuRef}>
                            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700/50">
                                <IconMoreHorizontal className="w-5 h-5" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 animate-fade-in-fast">
                                    <div className="py-1">
                                        <button onClick={(e) => e.stopPropagation()} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Skapa Slutfaktura</button>
                                        <button onClick={(e) => e.stopPropagation()} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Skapa Revisorsunderlag</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <IconUser className="w-4 h-4 text-gray-500" />
                    <span>{project.customerName}</span>
                </div>

                {/* STEG 2: Lägg till den nya komponenten. Den renderas bara om koordinater finns. */}
                {project.lat && project.lon && (
                    <div className="mb-4">
                        <WeatherForecast lat={project.lat} lon={project.lon} />
                    </div>
                )}
                
            </div>
            
            <div className="mt-auto">
                 {project.progress != null && (
                    <>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-400">Framsteg</span>
                            <span className="text-xs font-bold text-gray-200">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className={`${color.progress} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </>
                 )}
            </div>
        </div>
    );
};

export default ProjectCard;
