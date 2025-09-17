'use client';

import React from 'react';

const Sidebar = () => {
    return (
        <aside className="fixed top-0 left-0 w-64 h-full bg-gray-800 border-r border-gray-700 p-5">
            <div className="text-2xl font-bold text-cyan-400 mb-10">ByggPilot</div>
            <nav>
                <ul>
                    <li className="mb-4"><a href="/dashboard" className="text-gray-300 hover:text-white">Översikt</a></li>
                    <li className="mb-4"><a href="#" className="text-gray-300 hover:text-white">Dokument</a></li>
                    <li className="mb-4"><a href="#" className="text-gray-300 hover:text-white">Kunder</a></li>
                    {/* Fler länkar kan läggas till här */}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
