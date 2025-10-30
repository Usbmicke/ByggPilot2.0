
import React from 'react';
import { FolderIcon, BanknotesIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import ProjectCard from '../components/dashboard/ProjectCard'; 
import StatCard from '../components/dashboard/StatCard'; // Importera den nya StatCard-komponenten

// --- Huvudsida för Dashboard ---

export default async function DashboardPage() {
  const userName = "Michael";

  const stats = [
    { title: 'Totalt antal projekt', value: '12', icon: <BriefcaseIcon className="w-7 h-7 text-white" /> },
    { title: 'Pågående projekt', value: '5', icon: <FolderIcon className="w-7 h-7 text-white" /> },
    { title: 'Totala intäkter', value: '842,500 kr', icon: <BanknotesIcon className="w-7 h-7 text-white" /> },
  ];

  // Uppdaterad data med rating
  const projects = [
    { id: 1, title: 'Altanbygge, Kv. Eken', customer: 'Anna Bergqister, 173-2993', status: 75, rating: 4, team: ['/images/avatars/avatar-1.png', '/images/avatars/avatar-2.png'] },
    { id: 2, title: 'Takbyte & Fasadmålning', customer: 'Familjen Löfgren, 173-3012', status: 40, rating: 5, team: ['/images/avatars/avatar-3.png', '/images/avatars/avatar-4.png'] },
    { id: 3, title: 'Grundisolering', customer: 'BRF Utsikten, 173-3015', status: 90, rating: 3, team: ['/images/avatars/avatar-5.png'] },
    { id: 4, title: 'Balkongrenovering', customer: 'HSB Solängen, 173-3018', status: 60, rating: 4, team: ['/images/avatars/avatar-1.png', '/images/avatars/avatar-3.png', '/images/avatars/avatar-5.png'] },
  ];

  return (
    <div className="space-y-10">
      {/* Välkomstsektion */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">Välkommen tillbaka, {userName}!</h1>
        <p className="text-text-secondary mt-1">Här är en översikt över dina nuvarande projekt och uppgifter.</p>
      </div>

      {/* Statistiksektion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(stat => (
          <StatCard 
            key={stat.title} 
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
          />
        ))}
      </div>

      {/* Projektsektion */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Pågående Projekt</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
