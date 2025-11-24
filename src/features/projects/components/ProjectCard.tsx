
'use client';

import React from 'react';
import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';

// --- Typer för props ---
interface ProjectCardProps {
  title: string;
  customer: string;
  status: number; // Procent, 0-100
  team: { src: string; alt: string }[];
  lastUpdated: string;
  color: 'yellow' | 'blue' | 'green' | 'purple'; // Färg för statusbaren
}

// --- Färg-mappning för statusbaren ---
const colorClasses = {
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  purple: 'bg-purple-400',
};

// --- Komponent för enskilt projektkort ---
const ProjectCard: React.FC<ProjectCardProps> = ({ title, customer, status, team, lastUpdated, color }) => {
  return (
    <div className="bg-[#1C1C1E] border border-neutral-800/50 rounded-lg p-5 flex flex-col justify-between h-full">
      <div>
        {/* Topprad: Titel och färgklick */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <div className={`w-3 h-3 rounded-full ${colorClasses[color]} mt-1`}></div>
        </div>
        <p className="text-sm text-neutral-400 mb-4">{customer}</p>
        
        {/* Statusbar */}
        <div className="mb-1">
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Status</span>
                <span>{status}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-1.5">
                <div className={`${colorClasses[color]} h-1.5 rounded-full`} style={{ width: `${status}%` }}></div>
            </div>
        </div>
      </div>

      {/* Bottenrad: Team, uppdatering och meny */}
      <div className="flex justify-between items-center mt-5">
        <div className="flex -space-x-2">
          {team.map((member, index) => (
            <Image
              key={index}
              src={member.src}
              alt={member.alt}
              width={28}
              height={28}
              className="rounded-full border-2 border-[#1C1C1E]"
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-500">{lastUpdated}</span>
            <button className="text-neutral-500 hover:text-white">
                <MoreHorizontal size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
