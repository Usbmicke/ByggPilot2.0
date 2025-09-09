'use client';
import React, { useMemo, useState } from 'react'; // Importerar useState
import { Project, ProjectStatus } from '@/app/types';
import { IconFolder, IconFileText, IconFolderOpen, IconChevronRight } from '@/app/constants';

interface DocumentsViewProps {
    projects: Project[];
}

// Folder-komponenten förblir densamma, men vi gör den lite mer robust
const Folder = ({ name, children, defaultOpen = false, count }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 ease-in-out">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 rounded-t-xl transition-colors"
            >
                <div className="flex items-center gap-3">
                    {isOpen ? <IconFolderOpen className="w-7 h-7 text-cyan-400" /> : <IconFolder className="w-7 h-7 text-cyan-400" />}
                    <span className="font-bold text-gray-100 text-lg">{name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{count} {count === 1 ? 'objekt' : 'objekt'}</span>
                    <IconChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </div>
            </button>
            {isOpen && children && count > 0 && (
                <div className="p-4 border-t border-gray-700/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {children}
                    </div>
                </div>
            )}
            {isOpen && count === 0 && (
                 <div className="p-4 border-t border-gray-700/50 text-center text-gray-500 text-sm">
                    Inga projekt i denna kategori.
                </div>
            )}
        </div>
    );
};

// BUGGFIX 2: project.documents existerar inte. Ersätter med platshållare.
const ProjectFolder = ({ project }: { project: Project }) => (
    <div className="bg-gray-900/60 border border-gray-600 rounded-lg p-3 transition-colors hover:border-cyan-500/70 cursor-pointer">
        <div className="flex items-center gap-2 mb-2">
            <IconFolder className="w-6 h-6 text-cyan-500 flex-shrink-0" />
            <h4 className="font-semibold text-gray-200 truncate">{project.name}</h4>
        </div>
        {/* Ersätter den kraschande koden med en platshållare */}
        <div className="space-y-1 text-sm text-gray-400">
            <div className="flex items-center gap-2">
                <IconFileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Offert.pdf</span>
            </div>
            <div className="flex items-center gap-2">
                <IconFileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Projektplan.docx</span>
            </div>
        </div>
    </div>
);

const DocumentsView: React.FC<DocumentsViewProps> = ({ projects }) => {

    // BUGGFIX 1: Skyddsklausul. Säkerställ att `projects` är en array för att undvika krasch.
    const safeProjects = projects || [];

    const groupedProjects = useMemo(() => {
        const groups = {
            quote: [], // Ändrat namn för att matcha ProjectStatus.QUOTE
            ongoing: [],
            completed: []
        };
        
        // Använder `safeProjects` istället för `projects`
        safeProjects.forEach(p => {
            // Förenklad logik för att matcha de nya statusarna
            switch(p.status) {
                case ProjectStatus.QUOTE:
                    groups.quote.push(p);
                    break;
                case ProjectStatus.PLANNING:
                case ProjectStatus.ONGOING:
                    groups.ongoing.push(p);
                    break;
                case ProjectStatus.COMPLETED:
                case ProjectStatus.INVOICED:
                    groups.completed.push(p);
                    break;
            }
        });
        return groups;
    }, [safeProjects]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-2">Dokument</h2>
            <p className="text-gray-400 mb-8">Här simuleras din mappstruktur i Google Drive. ByggPilot skapar och underhåller denna struktur automatiskt åt dig.</p>
            
            <div className="space-y-6">
                <Folder name="01_Kunder & Anbud" defaultOpen={true} count={groupedProjects.quote.length}>
                    {groupedProjects.quote.map(project => 
                        <ProjectFolder key={project.id} project={project} />
                    )}
                </Folder>

                <Folder name="02_Pågående Projekt" defaultOpen={true} count={groupedProjects.ongoing.length}>
                    {groupedProjects.ongoing.map(project => 
                        <ProjectFolder key={project.id} project={project} />
                    )}
                </Folder>

                <Folder name="03_Avslutade Projekt" count={groupedProjects.completed.length}>
                    {groupedProjects.completed.map(project => 
                        <ProjectFolder key={project.id} project={project} />
                    )}
                </Folder>
            </div>
        </div>
    );
};

export default DocumentsView;
