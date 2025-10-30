
import React from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const Rating = ({ count }) => {
    const totalStars = 5;
    return (
        <div className="flex items-center">
            {[...Array(totalStars)].map((_, i) => {
                const isFilled = i < count;
                return isFilled ? 
                    <StarSolid key={i} className="h-5 w-5 text-yellow-400" /> : 
                    <StarOutline key={i} className="h-5 w-5 text-gray-500" />;
            })}
        </div>
    );
};

const ProjectCard = ({ project }) => {

    const getStatusColor = (status) => {
        if (status > 80) return 'bg-green-500';
        if (status > 50) return 'bg-blue-500';
        return 'bg-yellow-500';
    };

    return (
        <div className="bg-background-secondary rounded-xl shadow-lg p-6 flex flex-col justify-between h-full hover:shadow-primary-500/20 transition-shadow duration-300">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-text-primary hover:text-primary-400 transition-colors"><a href="#">{project.title}</a></h3>
                </div>
                <p className="text-sm text-text-secondary mb-5">{project.customer}</p>
                
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-text-secondary font-medium">Status</p>
                    <p className="text-sm font-bold text-text-primary">{project.status}%</p>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-4">
                    <div className={`${getStatusColor(project.status)} h-2 rounded-full transition-width duration-500`} style={{ width: `${project.status}%` }}></div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="flex -space-x-3">
                    {project.team.map((member, index) => (
                        <img key={index} className="w-9 h-9 rounded-full border-2 border-background-secondary transition-transform hover:scale-110" src={member} alt={`Team member ${index + 1}`} />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Rating count={project.rating} />
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
