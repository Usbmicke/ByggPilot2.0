
'use client';
import React, { useState } from 'react';
import { demoDocuments } from '../data';
import { Document } from '@/app/types';
import { FolderIcon, DocumentIcon, ChevronRightIcon, CloudArrowUpIcon, FolderPlusIcon } from '@heroicons/react/24/outline';
import { HomeIcon } from '@heroicons/react/24/solid';

const DemoDocumentsView = () => {
    const [currentPath, setCurrentPath] = useState('/');

    const getContentsForPath = (path: string): Document[] => {
        if (path === '/') return demoDocuments;
        const pathParts = path.split('/').filter(p => p);
        let currentLevel = demoDocuments;
        for (const part of pathParts) {
            const nextLevel = currentLevel.find(doc => doc.type === 'folder' && doc.name === part);
            if (nextLevel && nextLevel.children) {
                currentLevel = nextLevel.children;
            } else {
                return [];
            }
        }
        return currentLevel;
    };

    const handleItemClick = (item: Document) => {
        if (item.type === 'folder') {
            setCurrentPath(item.path);
        }
    };

    const breadcrumbs = currentPath.split('/').filter(p => p);
    const currentContents = getContentsForPath(currentPath);

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dokumenthantering</h1>
                    <p className="text-gray-400 mt-1">Alla dina projektfiler, offerter och ritningar samlade på ett ställe.</p>
                </div>
                <div className="flex gap-2">
                     <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                        <FolderPlusIcon className="w-5 h-5" />
                        Ny Mapp
                    </button>
                    <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
                        <CloudArrowUpIcon className="w-5 h-5" />
                        Ladda upp
                    </button>
                </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg">
                {/* Breadcrumb-navigering */}
                <div className="flex items-center text-gray-400 p-4 border-b border-gray-700/50 text-sm">
                    <HomeIcon className="w-5 h-5 mr-2 text-gray-500"/>
                    <button onClick={() => setCurrentPath('/')} className="font-semibold text-gray-300 hover:text-white transition-colors">Rot</button>
                    {breadcrumbs.map((part, index) => {
                        const path = '/' + breadcrumbs.slice(0, index + 1).join('/');
                        return (
                            <React.Fragment key={index}>
                                <ChevronRightIcon className="w-4 h-4 mx-1 text-gray-600" />
                                <button onClick={() => setCurrentPath(path)} className="font-semibold text-gray-300 hover:text-white transition-colors">{part}</button>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Listan med filer och mappar */}
                <ul className="divide-y divide-gray-700/50">
                    {currentContents.length > 0 ? currentContents.map(item => (
                        <li key={item.id} onClick={() => handleItemClick(item)} 
                            className={`flex items-center p-4 transition-colors duration-150 ${item.type === 'folder' ? 'cursor-pointer hover:bg-cyan-900/20' : 'hover:bg-gray-700/30'}`}>
                            {item.type === 'folder' 
                                ? <FolderIcon className="h-6 w-6 text-cyan-400 mr-4 flex-shrink-0" /> 
                                : <DocumentIcon className="h-6 w-6 text-gray-400 mr-4 flex-shrink-0" />}
                            <span className="font-medium text-white truncate">{item.name}</span>
                        </li>
                    )) : (
                        <li className="p-8 text-center text-gray-500">Den här mappen är tom.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default DemoDocumentsView;
