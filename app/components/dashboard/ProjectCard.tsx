'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectStatus } from '@/app/types';
import { IconSun, IconCloud, IconCloudRain, IconChevronDown, IconChevronUp, IconMoreHorizontal } from '@/app/constants';

interface ProjectCardProps {
  project: Project;
  showWeather: boolean;
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; progress: string }> = {
    [ProjectStatus.PLANNING]: { bg: 'bg-yellow-400/20', text: 'text-yellow-300', progress: 'bg-yellow-400' },
    [ProjectStatus.ONGOING]: { bg: 'bg-cyan-400/20', text: 'text-cyan-300', progress: 'bg-cyan-400' },
    [ProjectStatus.COMPLETED]: { bg: 'bg-green-400/20', text: 'text-green-300', progress: 'bg-green-400' },
    [ProjectStatus.INVOICED]: { bg: 'bg-purple-400/20', text: 'text-purple-300', progress: 'bg-purple-400' },
};

const cardBaseStyle = "bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10";

// Simplified weather codes from Open-Meteo
const getWeatherIcon = (code: number) => {
    if (code <= 1) return <IconSun className="w-5 h-5 text-yellow-300" />;
    if (code <= 3) return <IconCloud className="w-5 h-5 text-gray-300" />;
    if (code >= 51 && code <= 99) return <IconCloudRain className="w-5 h-5 text-blue-300" />;
    return <IconCloud className="w-5 h-5 text-gray-300" />;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, showWeather }) => {
    const color = statusColors[project.status];
    const [weather, setWeather] = useState<any>(null);
    const [showForecast, setShowForecast] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showWeather) return;
        const fetchWeather = async () => {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${project.lat}&longitude=${project.lon}&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=7`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Weather fetch failed');
                const data = await response.json();
                setWeather(data.daily);
            } catch (error) {
                console.error("Failed to fetch weather:", error);
            }
        };
        fetchWeather();
    }, [project.lat, project.lon, showWeather]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const today = new Date();
    const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

    return (
        <div className={cardBaseStyle}>
            <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-gray-100 flex-1">{project.name}</h3>
                     <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color.bg} ${color.text} whitespace-nowrap`}>
                            {project.status}
                        </span>
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700/50">
                                <IconMoreHorizontal className="w-5 h-5" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 animate-fade-in-fast">
                                    <div className="py-1">
                                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Skapa Slutfaktura</button>
                                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Skapa Revisorsunderlag</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-400">{project.customer.name}</p>
                <p className="text-sm text-gray-500 mb-4">{project.address}</p>
                
                {showWeather && weather && (
                    <div className="mb-4">
                        <button onClick={() => setShowForecast(!showForecast)} className="w-full flex justify-between items-center text-left p-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                             <div className="flex items-center gap-2">
                                {getWeatherIcon(weather.weather_code[0])}
                                <span className="text-sm font-medium text-gray-300">Idag: {Math.round(weather.temperature_2m_max[0])}°C</span>
                            </div>
                            <span className="text-xs text-cyan-400 flex items-center gap-1">
                                7-dagarsprognos
                                {showForecast ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />}
                            </span>
                        </button>
                        {showForecast && (
                            <div className="mt-2 p-3 bg-gray-900/50 rounded-lg space-y-2">
                                {weather.time.slice(1, 7).map((day: string, index: number) => (
                                    <div key={day} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">{dayNames[(today.getDay() + index + 1) % 7]}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-300">{Math.round(weather.temperature_2m_max[index + 1])}°C</span>
                                            {getWeatherIcon(weather.weather_code[index + 1])}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="mt-auto">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-400">Framsteg</span>
                    <span className="text-xs font-bold text-gray-200">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${color.progress} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
