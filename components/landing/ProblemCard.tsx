
import React from 'react';

const cardBaseStyle = "bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-300";
const cardHoverEffect = "hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.2)] hover:border-blue-500/60";

const SolutionStyle = ({ children }) => (
    <div className="mt-auto pt-4 border-t border-blue-500/20">
        <p className="text-sm text-blue-400">
            <span className="font-bold">ByggPilots Lösning:</span> <span className="italic">{children}</span>
        </p>
    </div>
);

export const ProblemCard = ({ icon, title, problem, solution }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect} flex flex-col`}>
        <div className="text-blue-400 mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400 mb-3 text-sm flex-grow">{problem}</p>
        <SolutionStyle>{solution}</SolutionStyle>
    </div>
);
