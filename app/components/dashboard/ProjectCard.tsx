
'use client';

import React from 'react';
import Link from 'next/link';
import { Project, ProjectStatus } from '@/types/project';
import { DocumentTextIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
    project: Project;
    onReportTime: (projectId: string) => void;
}

const statusColors: { [key in ProjectStatus]: { bg: string, text: string, border: string } } = {
    'Offert': { bg: 'bg-yellow-900/50', text: 'text-yellow-300', border: 'border-yellow-700/80' },
    'Pågående': { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-700/80' },
    'Avslutat': { bg: 'bg-green-900/50', text: 'text-green-300', border: 'border-green-700/80' },
    'Fakturerat': { bg: 'bg-gray-700/50', text: 'text-gray-300', border: 'border-gray-600/80' },
};

export default function ProjectCard({ project, onReportTime }: ProjectCardProps) {
    const router = useRouter();
    const color = statusColors[project.status] || statusColors['Fakturerat'];

    return (
        <div className={`flex flex-col justify-between p-6 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300 ${color.bg} border ${color.border}`}>
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white truncate pr-4">{project.projectName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
                        {project.status}
                    </span>
                </div>
                <div className="mt-4 flex items-center text-gray-400">
                    <UserIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm">{project.clientName}</span>
                </div>
                <div className="mt-2 flex items-center text-gray-400">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    <span className="text-sm">Projektnummer: {project.projectNumber || 'N/A'}</span>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-end space-x-2">
                 <button onClick={() => router.push(`/dashboard/projects/${project.id}`)} className="text-sm text-gray-300 hover:text-white transition-colors">
                    Öppna
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onReportTime(project.id); }}
                    className="inline-flex items-center bg-cyan-600/80 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Rapportera Tid
                </button>
            </div>
        </div>
    );
}
