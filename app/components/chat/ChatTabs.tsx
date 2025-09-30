
'use client';

import React, { useState } from 'react';

const ChatTabs = () => {
  const [activeTab, setActiveTab] = useState('assistant');

  const renderContent = () => {
    switch (activeTab) {
      case 'assistant':
        return null; // Meddelandelistan renderas nu direkt i ChatWidget
      case 'project':
        return <p className="text-center p-4">Projekt-specifik chatt kommer snart!</p>;
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-border-primary">
      <div className="flex space-x-4 px-4">
        <button 
          onClick={() => setActiveTab('assistant')} 
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'assistant' ? 'border-b-2 border-accent-blue text-white' : 'text-gray-400'}`}>
          Assistent
        </button>
        <button 
          onClick={() => setActiveTab('project')} 
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'project' ? 'border-b-2 border-accent-blue text-white' : 'text-gray-400'}`}>
          Projekt
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default ChatTabs;

