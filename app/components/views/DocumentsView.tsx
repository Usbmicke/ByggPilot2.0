'use client';
import React, { useMemo } from 'react';
import { Project, ProjectStatus } from '@/app/types';
import { IconFolder, IconFileText, IconFolderOpen } from '@/app/constants';

interface DocumentsViewProps {
    projects: Project[];
}

const Folder = ({ name, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 ease-in-out">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 rounded-t-xl"
            >
                <div className="flex items-center gap-3">
                    {isOpen ? <IconFolderOpen className="w-7 h-7 text-cyan-400" /> : <IconFolder className="w-7 h-7 text-cyan-400" />}
                    <span className="font-bold text-gray-100 text-lg">{name}</span>
                </div>
                <span className="text-sm text-gray-500">{children.length} objekt</span>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectFolder = ({ project }: { project: Project }) => (
    <div className="bg-gray-900/60 border border-gray-600 rounded-lg p-3 transition-colors hover:border-cyan-500/70">
        <div className="flex items-center gap-2 mb-3">
            <IconFolder className="w-6 h-6 text-cyan-500" />
            <h4 className="font-semibold text-gray-200 truncate">{project.name}</h4>
        </div>
        <div className="space-y-1.5 text-sm">
            {project.documents.slice(0, 4).map(doc => (
                <div key={doc.id} className="flex items-center gap-2 text-gray-400">
                    <IconFileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{doc.name}</span>
                </div>
            ))}
            {project.documents.length > 4 && (
                <p className="text-xs text-gray-500 pt-1">+ {project.documents.length - 4} till...</p>
            )}
        </div>
    </div>
);

const DocumentsView: React.FC<DocumentsViewProps> = ({ projects }) => {

    const groupedProjects = useMemo(() => {
        const groups = {
            anbud: [],
            pagaende: [],
            avslutade: []
        };
        projects.forEach(p => {
            if (p.status === ProjectStatus.PLANNING) groups.anbud.push(p);
            else if (p.status === ProjectStatus.ONGOING) groups.pagaende.push(p);
            else if (p.status === ProjectStatus.COMPLETED || p.status === ProjectStatus.INVOICED) groups.avslutade.push(p);
        });
        return groups;
    }, [projects]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-2">Dokument</h2>
            <p className="text-gray-400 mb-8">Här simuleras din mappstruktur i Google Drive. ByggPilot skapar och underhåller denna struktur automatiskt åt dig.</p>
            
            <div className="space-y-6">
                <Folder name="01_Kunder & Anbud" defaultOpen={true}>
                    {groupedProjects.anbud.map(project => 
                        <ProjectFolder key={project.id} project={project} />
                    )}
                </Folder>

                <Folder name="02_Pågående Projekt" defaultOpen={true}>
                    {groupedProjects.pagaende.map(project => 
                        <ProjectFolder key={project.id} project={project} />
                    )}
                </Folder>

                <Folder name="03_Avslutade Projekt">
                    {groupedProjects.avslutade.map(project => 
                        <ProjectFolder key={project.id} project={project} />
                    )}
                </Folder>
            </div>
        </div>
    );
};

export default DocumentsView;
