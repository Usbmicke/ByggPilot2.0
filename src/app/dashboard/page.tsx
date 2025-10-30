
import React from 'react';
import { BriefcaseIcon, FolderOpenIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import ProjectCard from '../components/dashboard/ProjectCard'; 
import StatCard from '../components/dashboard/StatCard';

// --- Huvudsida för Dashboard (Server Component) ---
// Denna komponent renderas på servern för maximal prestanda.

async function getDashboardData() {
  // I en verklig applikation skulle denna data hämtas från en databas.
  const userName = "Michael";

  const stats = [
    { title: 'Totalt antal projekt', value: '12', icon: <BriefcaseIcon className="w-7 h-7 text-gray-300" /> },
    { title: 'Pågående projekt', value: '5', icon: <FolderOpenIcon className="w-7 h-7 text-gray-300" /> },
    { title: 'Totala intäkter', value: '842,500 kr', icon: <BanknotesIcon className="w-7 h-7 text-gray-300" /> },
  ];

  const projects = [
    { id: 1, title: 'Altanbygge, Kv. Eken', customer: 'Anna Bergsäter, 173-2993', status: 75, rating: 4.2, team: ['/images/avatars/avatar-1.png', '/images/avatars/avatar-2.png', '/images/avatars/avatar-3.png'] },
    { id: 2, title: 'Takbyte & Fasadmålning', customer: 'Familjen Löfgren, 173-3012', status: 40, rating: 5, team: ['/images/avatars/avatar-4.png', '/images/avatars/avatar-5.png'] },
    { id: 3, title: 'Grundisolering', customer: 'BRF Utsikten, 173-3015', status: 90, rating: 3.8, team: ['/images/avatars/avatar-1.png', '/images/avatars/avatar-4.png'] },
    { id: 4, title: 'Balkongrenovering', customer: 'HSB Solängen, 173-3018', status: 60, rating: 4.5, team: ['/images/avatars/avatar-2.png', '/images/avatars/avatar-3.png', '/images/avatars/avatar-5.png'] },
  ];

  return { userName, stats, projects };
}

export default async function DashboardPage() {
  const { userName, stats, projects } = await getDashboardData();

  return (
    <div className="space-y-8">
      
      {/* ---- Övre sektionen: Välkomsttitel och Stat-kort ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
        
        {/* Välkomsttitel (tar upp 1 kolumn på stora skärmar) */}
        <div className="lg:col-span-1 xl:col-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">Välkommen tillbaka,</h1>
          <h2 className="text-4xl font-bold tracking-tight text-cyan-400">{userName}!</h2>
        </div>

        {/* Stat-kort (tar upp 2 kolumner och placeras till höger) */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <StatCard 
            icon={stats[0].icon}
            title={stats[0].title}
            value={stats[0].value}
            className="col-span-1"
          />
          <StatCard 
            icon={stats[1].icon}
            title={stats[1].title}
            value={stats[1].value}
            className="col-span-1"
          />
          <StatCard 
            icon={stats[2].icon}
            title={stats[2].title}
            value={stats[2].value}
            className="col-span-2" // Tar upp hela bredden
          />
        </div>
      </div>

      {/* ---- Undre sektionen: Pågående Projekt ---- */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-5">Pågående Projekt</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
