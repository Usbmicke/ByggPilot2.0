
import React from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

// --- Sub-komponent för Stjärnbetyg ---
// Optimerad och renad för att hantera hel- och halvstjärnor.
const Rating: React.FC<{ rating: number }> = ({ rating }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} className="h-5 w-5 text-amber-400" />)}
            {halfStar && <StarIcon key="half" className="h-5 w-5 text-amber-400 opacity-50" /> /* Simulerar halvstjärna */}
            {[...Array(emptyStars)].map((_, i) => <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-600" />)}
        </div>
    );
};

// --- Sub-komponent för Team-avatarer ---
const TeamAvatars: React.FC<{ team: string[] }> = ({ team }) => (
    <div className="flex -space-x-3">
        {team.map((avatarUrl, index) => (
            <div key={index} className="w-9 h-9 rounded-full overflow-hidden border-2 border-zinc-800 ring-2 ring-zinc-800">
                <Image 
                    src={avatarUrl} 
                    alt={`Team member ${index + 1}`} 
                    width={36} 
                    height={36} 
                    className="object-cover"
                />
            </div>
        ))}
    </div>
);

// --- Huvudkomponent: ProjectCard ---
interface Project {
  id: number;
  title: string;
  customer: string;
  status: number;
  rating: number;
  team: string[];
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    // Status-baren är nu alltid cyan för en enhetlig design.
    const statusColor = "bg-cyan-500";

    return (
        <div className="bg-zinc-800/70 rounded-xl p-5 flex flex-col justify-between h-full border border-zinc-700/80 hover:border-zinc-700 transition-colors duration-300">
            <div>
                {/* Kortets header: Titel och Meny-ikon */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-100 hover:text-cyan-400 transition-colors"><a href="#">{project.title}</a></h3>
                    <button className="p-1 text-gray-500 hover:text-white rounded-full transition-colors">
                        <EllipsisHorizontalIcon className="h-6 w-6" />
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-5">{project.customer}</p>
                
                {/* Status-sektion */}
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-400 font-medium">Status</p>
                    <p className="text-sm font-bold text-gray-200">{project.status}%</p>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2.5 mb-4">
                    <div className={`${statusColor} h-2.5 rounded-full`} style={{ width: `${project.status}%` }}></div>
                </div>
            </div>
            
            {/* Kortets footer: Team och Betyg */}
            <div className="flex justify-between items-center mt-4">
                <TeamAvatars team={project.team} />
                <Rating rating={project.rating} />
            </div>
        </div>
    );
};

export default ProjectCard;
