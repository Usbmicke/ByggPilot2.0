
'use client';

import React, { useState } from 'react';
import { Briefcase, FolderOpen, Landmark, Plus, Sun, ChevronDown, ChevronUp } from 'lucide-react';
import StatCard from '@/app/_components/dashboard/StatCard';
import ProjectCard from '@/app/_components/dashboard/ProjectCard'; 
import { useAuth } from '@/app/_providers/ClientProviders';

// =======================================================================
//  WIDGETS (PLATSHÅLLARE)
// =======================================================================

const WeatherWidget = () => (
    <div className="bg-[#1C1C1E] border border-neutral-800/50 p-4 rounded-lg flex items-center gap-4">
        <Sun className="w-8 h-8 text-yellow-400" />
        <div>
            <p className="text-xl font-bold text-white">18°C</p>
            <p className="text-sm text-neutral-400">Stockholm</p>
        </div>
    </div>
);

const TodoWidget = () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-[#1C1C1E] border border-neutral-800/50 p-4 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Att Göra</h3>
                {isOpen ? <ChevronUp className="text-neutral-400"/> : <ChevronDown className="text-neutral-400"/>}
            </button>
            {isOpen && (
                <div className="text-neutral-300 text-sm animate-fade-in-down">Här kommer dina uppgifter från Google Tasks...</div>
            )}
        </div>
    );
};


// =======================================================================
//  HUVUDSIDA: ÖVERSIKT (DASHBOARD)
// =======================================================================

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.displayName?.split(' ')[0] || 'Användare';

  // Simulerad data för att demonstrera "Zero State" vs. "Data State"
  const projects: any[] = []; // Ändra till en tom array för att se "Zero State"

  // Simulerad data för KPI-kort
  const stats = {
    totalRevenue: "842,500 kr",
    revenueComparison: { value: "12%", direction: 'up' as const },
    ongoingProjects: 5,
    projectsComparison: { value: "2%", direction: 'down' as const },
    newLeads: 3,
    leadsComparison: { value: "5%", direction: 'up' as const },
  };

  return (
    <div className="flex flex-col gap-8 text-white animate-fadeIn">
      
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Välkommen tillbaka, {userName}!</h1>
      
      {/* --- KPI-KORT & WIDGETS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            icon={<Landmark className="w-5 h-5" />}
            title="Totala Intäkter (Fakturerat)"
            value={stats.totalRevenue}
            comparison={stats.revenueComparison}
          />
          <StatCard 
            icon={<FolderOpen className="w-5 h-5" />}
            title="Pågående Projekt"
            value={stats.ongoingProjects}
            comparison={stats.projectsComparison}
          />
          <StatCard 
            icon={<Briefcase className="w-5 h-5" />}
            title="Nya Förfrågningar"
            value={stats.newLeads}
            comparison={stats.leadsComparison}
          />
          <div className="flex flex-col gap-5">
            <WeatherWidget />
            <TodoWidget />
          </div>
      </div>

      {/* --- "ZERO STATE" ELLER PROJEKTLISTA --- */}
      <div className="mt-4">
        {projects.length === 0 ? (
          // "Zero State": Inga projekt finns
          <div className="text-center bg-[#1C1C1E] border border-dashed border-neutral-700/80 rounded-xl py-20 px-8 flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-2">Dags att skapa ditt första projekt!</h2>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">Använd ByggPilot för att hantera allt från offerter och tidrapporter till kundkontakt – allt på ett ställe.</p>
            <button className="bg-white text-black font-bold flex items-center justify-center gap-2 py-3 px-6 rounded-lg hover:bg-neutral-200 transition-colors duration-200 shadow-lg">
                <Plus size={20} />
                Skapa ditt första projekt
            </button>
          </div>
        ) : (
          // Projektlista: Projekt finns
          <div>
            <h2 className="text-2xl font-bold mb-4">Pågående Projekt</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {/* Här skulle du mappa dina ProjectCard-komponenter */}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
