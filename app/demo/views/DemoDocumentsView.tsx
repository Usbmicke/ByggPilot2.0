
'use client';
import React, { useState } from 'react';
import { demoDocuments } from '../data';
import { Document } from '@/app/types';

// Ikoner för filer och mappar
const FolderIcon = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const FileIcon = (props) => <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" /></svg>;

const DemoDocumentsView = () => {
    // Håller koll på den nuvarande sökvägen, börjar i roten
    const [currentPath, setCurrentPath] = useState('/');

    // Hittar rätt filer/mappar att visa baserat på sökvägen
    const getContentsForPath = (path: string): Document[] => {
        if (path === '/') {
            return demoDocuments; // Roten
        }
        const pathParts = path.split('/').filter(p => p);
        let currentLevel = demoDocuments;
        for (const part of pathParts) {
            const nextLevel = currentLevel.find(doc => doc.type === 'folder' && doc.name === part);
            if (nextLevel && nextLevel.children) {
                currentLevel = nextLevel.children;
            } else {
                return []; // Hittade inte sökvägen
            }
        }
        return currentLevel;
    };

    const currentContents = getContentsForPath(currentPath);

    // Hanterar klick på en fil eller mapp
    const handleItemClick = (item: Document) => {
        if (item.type === 'folder') {
            setCurrentPath(item.path);
        }
        // I en riktig app skulle man kunna förhandsgranska en fil här
    };

    // Skapar breadcrumbs för navigering
    const breadcrumbs = currentPath.split('/').filter(p => p);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-white">Dokument (Demo)</h1>
            </div>
            {/* Breadcrumb-navigering */}
            <div className="flex items-center text-gray-400 mb-4 text-sm">
                <button onClick={() => setCurrentPath('/')} className="hover:text-white">Rot</button>
                {breadcrumbs.map((part, index) => {
                    const path = '/' + breadcrumbs.slice(0, index + 1).join('/');
                    return <span key={index}><span className="mx-2">/</span><button onClick={() => setCurrentPath(path)} className="hover:text-white">{part}</button></span>;
                })}
            </div>

            {/* Listan med filer och mappar */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
                <ul className="divide-y divide-gray-700/50">
                    {currentContents.map(item => (
                        <li key={item.id} onClick={() => handleItemClick(item)} className="flex items-center p-3 cursor-pointer hover:bg-gray-700/50 transition-colors duration-150">
                            {item.type === 'folder' ? <FolderIcon className="h-6 w-6 text-cyan-400 mr-4" /> : <FileIcon className="h-6 w-6 text-gray-400 mr-4" />}
                            <span className="font-medium text-white">{item.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default DemoDocumentsView;
