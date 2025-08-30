
import React from 'react';
import { Project } from '../../types';
import { IconFolder, IconFileText } from '../../constants';

interface DocumentsViewProps {
    projects: Project[];
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ projects }) => {
    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-2">Dokument</h2>
            <p className="text-gray-400 mb-6">Här simuleras en vy av dina projektmappar i Google Drive.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-cyan-400/50 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <IconFolder className="w-8 h-8 text-cyan-400" />
                            <div>
                                <h3 className="font-bold text-gray-100">{project.name}</h3>
                                <p className="text-sm text-gray-500">{project.documents.length} objekt</p>
                            </div>
                        </div>
                        <div className="space-y-2 border-t border-gray-700 pt-3">
                             {project.documents.slice(0, 3).map(doc => (
                                <div key={doc.id} className="flex items-center gap-2">
                                    <IconFileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-300 truncate">{doc.name}</span>
                                </div>
                             ))}
                             {project.documents.length > 3 && (
                                 <p className="text-xs text-gray-500 pt-1">+ {project.documents.length - 3} till...</p>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentsView;
