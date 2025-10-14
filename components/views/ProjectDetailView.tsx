'use client';

import React, { useState } from 'react';
import { Project, Invoice, Ata, Document } from '@/types';
import InvoicingView from './InvoicingView';
import AtaView from './AtaView';
import DocumentsView from './DocumentsView';
import ProjectDashboard from '@/components/dashboard/ProjectDashboard'; // Återanvänd dashboarden

// Steg 1: Uppdatera props för att ta emot all data från servern
interface ProjectDetailViewProps {
  project: Project;
  initialInvoices: Invoice[];
  initialAtas: Ata[];
  initialDocuments: Document[];
}

// Steg 2: Skapa en typ för flikarna
type Tab = 'invoices' | 'atas' | 'documents';

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ 
    project, 
    initialInvoices, 
    initialAtas, 
    initialDocuments 
}) => {
  
  // Steg 3: State för att hantera aktiv flik
  const [activeTab, setActiveTab] = useState<Tab>('invoices');

  // Steg 4: Funktion för att rendera innehållet i fliken
  const renderTabContent = () => {
    switch (activeTab) {
      case 'invoices':
        return <InvoicingView project={project} initialInvoices={initialInvoices} />;
      case 'atas':
        return <AtaView project={project} initialAtas={initialAtas} />;
      case 'documents':
        return <DocumentsView initialDocuments={initialDocuments} />;
      default:
        return null;
    }
  };

  // Steg 5: Funktion för att byta flik, med stilning för aktiv flik
  const TabButton: React.FC<{ tabName: Tab; label: string; }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-cyan-500 text-white'
          : 'text-gray-300 hover:bg-gray-700'
      }`}>
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900">
        {/* Återanvänd den befintliga dashboard-komponenten för en enhetlig look */}
        <ProjectDashboard project={project} />

        {/* Flik-navigation */}
        <div className="px-4 md:px-8 border-b border-gray-700">
            <div className="flex items-center gap-4">
                <TabButton tabName="invoices" label="Fakturering" />
                <TabButton tabName="atas" label="ÄTA" />
                <TabButton tabName="documents" label="Dokument" />
            </div>
        </div>

        {/* Innehåll för den valda fliken */}
        <div className="flex-grow overflow-y-auto">
            {renderTabContent()}
        </div>
    </div>
  );
};

export default ProjectDetailView;
