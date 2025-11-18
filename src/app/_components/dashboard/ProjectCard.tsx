
import React from 'react';
import { Project, ProjectStatus } from '@/lib/schemas/project';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
    project: Project;
}

// =========================================================================
// == PROJECT CARD V3 - "Clean UI" Edition =================================
// =========================================================================
// Helt omskriven för det nya designsystemet. Fokuserar på tydlighet,
// visuell hierarki och en modern känsla.

// --- Status Mapping --- 
// Centraliserar logik för färg och text baserat på status.
const statusStyles: { [key in ProjectStatus]: { border: string; bg: string; text: string; label: string } } = {
  completed: { border: 'border-success', bg: 'bg-success/10', text: 'text-success-foreground', label: 'Avslutad' },
  ongoing: { border: 'border-warning', bg: 'bg-warning/10', text: 'text-warning-foreground', label: 'Pågående' },
  critical: { border: 'border-destructive', bg: 'bg-destructive/10', text: 'text-destructive-foreground', label: 'Kritiskt' },
  paused: { border: 'border-border-color', bg: 'bg-secondary/10', text: 'text-secondary-foreground', label: 'Pausad' },
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {

    const status = statusStyles[project.status] || statusStyles.paused;

    return (
        <Link href={`/dashboard/projects/${project.id}`} className="block w-full">
            <div 
                className={`group bg-background-secondary rounded-xl p-5 flex flex-col h-full 
                          border-l-4 ${status.border} 
                          transition-all duration-200 hover:bg-background-tertiary hover:-translate-y-1`}
            >
                {/* ---- KORTETS HUVUD ---- */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
                        {project.projectName}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                        {status.label}
                    </div>
                </div>
                <p className="text-sm text-text-secondary mb-5 truncate">{project.clientName}</p>
                
                {/* ---- PROGRESS-STAPEL ---- */}
                <div className="mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                        <p className="text-sm text-text-secondary font-medium">Framsteg</p>
                        <p className="text-sm font-bold text-text-primary">{project.progress}%</p>
                    </div>
                    <div className="w-full bg-background-tertiary rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${project.progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* ---- EKONOMI-ÖVERSIKT ---- */}
                <div className="mt-auto pt-4 border-t border-border-color space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Intäkter</span>
                        <span className="font-medium text-text-primary">{project.totalRevenue.toLocaleString('sv-SE')} kr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Kostnader</span>
                        <span className="font-medium text-text-primary">{project.totalCost.toLocaleString('sv-SE')} kr</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
