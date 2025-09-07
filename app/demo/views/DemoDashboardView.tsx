
'use client';
import React from 'react';
import { demoProjects, demoTimeEntries } from '../data'; // Importerar vår påhittade data

// Återanvändbara ikoner för korten
const ProjectIcon = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const TimeIcon = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>;

const DemoDashboardView = () => {
    // Plockar ut de två senaste projekten och tidrapporterna
    const recentProjects = demoProjects.slice(0, 2);
    const recentTimeEntries = demoTimeEntries.slice(0, 2);

    // En enkel statisk widget
    const KpiCard = ({ title, value, icon }) => (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center">
            <div className="p-2 bg-cyan-900/50 rounded-lg mr-4">{icon}</div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Översikt (Demo)</h1>
            
            {/* KPI-kort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <KpiCard title="Pågående Projekt" value={demoProjects.filter(p => p.status === 'Pågående').length} icon={<ProjectIcon className="h-6 w-6 text-cyan-400"/>} />
                <KpiCard title="Nya Anbud" value={demoProjects.filter(p => p.status === 'Anbud').length} icon={<ProjectIcon className="h-6 w-6 text-yellow-400"/>} />
                <KpiCard title="Rapporterade Timmar (7d)" value="14.5" icon={<TimeIcon className="h-6 w-6 text-green-400"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Senaste Projekt */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Senaste Projekt</h2>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                        <ul className="divide-y divide-gray-700/50">
                            {recentProjects.map(project => (
                                <li key={project.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-white">{project.name}</p>
                                        <p className="text-sm text-gray-400">{project.customerName}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'Pågående' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {project.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Senaste Tidrapporter */}
                <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Senaste Tidrapporter</h2>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                        <ul className="divide-y divide-gray-700/50">
                            {recentTimeEntries.map(entry => (
                                <li key={entry.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-white">{entry.projectName}</p>
                                            <p className="text-sm text-gray-400">{entry.comment}</p>
                                        </div>
                                        <p className="text-right font-mono text-white">{entry.hours.toFixed(2)}h</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DemoDashboardView;
