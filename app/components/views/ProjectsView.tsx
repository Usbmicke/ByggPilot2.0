'use client';
import React from 'react';
import { Project, ProjectStatus } from '@/app/types';

interface ProjectsViewProps {
    projects: Project[];
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; }> = {
    [ProjectStatus.PLANNING]: { bg: 'bg-yellow-400/20', text: 'text-yellow-300' },
    [ProjectStatus.ONGOING]: { bg: 'bg-cyan-400/20', text: 'text-cyan-300' },
    [ProjectStatus.COMPLETED]: { bg: 'bg-green-400/20', text: 'text-green-300' },
    [ProjectStatus.INVOICED]: { bg: 'bg-purple-400/20', text: 'text-purple-300' },
};

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Alla Projekt</h2>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/70">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-400">Projektnamn</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Kund</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Framsteg</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Entreprenadform</th>
                            <th className="p-4 text-sm font-semibold text-gray-400">Ansvarig</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(project => {
                            const color = statusColors[project.status];
                            return (
                                <tr key={project.id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 text-gray-200 font-medium">{project.name}</td>
                                    <td className="p-4 text-gray-300">{project.customer.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color.bg} ${color.text} whitespace-nowrap`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-700 rounded-full h-2">
                                                <div className={`${project.status === ProjectStatus.ONGOING ? 'bg-cyan-400' : project.status === ProjectStatus.COMPLETED ? 'bg-green-400' : 'bg-yellow-400'} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs">{project.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{project.entreprenadform}</td>
                                    <td className="p-4 text-gray-300">{project.ansvarig}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectsView;
