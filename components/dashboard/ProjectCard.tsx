
'use client';

import React from 'react';
import Link from 'next/link';
import { Project, ProjectStatus } from '@/types/project';
import { DocumentTextIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Korrigerad importsökväg

interface ProjectCardProps {
    project: Project;
    onReportTime: (projectId: string) => void;
}

// Uppdaterade statusfärger som matchar tailwind.config.ts
const statusClasses: { [key in ProjectStatus]: { text: string, dot: string } } = {
    'Offert': { text: 'text-status-yellow', dot: 'bg-status-yellow' },
    'Pågående': { text: 'text-status-blue', dot: 'bg-status-blue' },
    'Avslutat': { text: 'text-status-green', dot: 'bg-status-green' },
    'Fakturerat': { text: 'text-text-secondary', dot: 'bg-text-secondary' },
};

export default function ProjectCard({ project, onReportTime }: ProjectCardProps) {
    const router = useRouter();
    const statusStyle = statusClasses[project.status] || statusClasses['Fakturerat'];

    return (
        <div className="flex flex-col justify-between p-5 rounded-lg bg-component-background border border-border hover:border-accent transition-colors duration-300 group">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-text-primary truncate pr-4 group-hover:text-accent transition-colors">{project.projectName}</h3>
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${statusStyle.dot}`}></div>
                        <span className={`text-xs font-medium ${statusStyle.text}`}>
                            {project.status}
                        </span>
                    </div>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{project.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4" />
                        <span>Projektnummer: {project.projectNumber || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div className="mt-5 flex items-center justify-end space-x-2">
                 <Button variant="ghost" size="sm" onClick={() => router.push(`/projects/${project.id}`)}>
                    Öppna
                </Button>
                <Button 
                    variant="default" 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onReportTime(project.id); }}
                >
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Rapportera Tid
                </Button>
            </div>
        </div>
    );
}
