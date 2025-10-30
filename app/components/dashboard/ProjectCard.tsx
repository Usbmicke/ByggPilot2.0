
import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

interface Project {
    id: string;
    name: string;
    customer: string;
    address: string;
    status: number; 
    team: { name: string; avatarUrl: string }[];
    rating: number;
}

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <div className="bg-gray-800/50 rounded-lg p-5 border border-transparent hover:border-accent-blue transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-white text-lg">{project.name}</h3>
                    <p className="text-sm text-gray-400">{project.customer}, {project.address}</p>
                </div>
                <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < project.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Status</span>
                    <span className="text-sm font-bold text-white">{project.status}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-accent-blue h-2 rounded-full" style={{ width: `${project.status}%` }}></div>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="flex -space-x-2 overflow-hidden">
                    {project.team.map((member, index) => (
                        <div key={index} className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800 bg-gray-600 flex items-center justify-center text-white font-bold text-xs">
                            {member.name.substring(0, 1).toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
