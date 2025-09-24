
'use client';

import React, { useState, useEffect } from 'react';
import { IconSun, IconCloud, IconCloudRain, IconSnowflake, IconWind } from '@/app/constants';

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
}

// Helper-funktion för att mappa väderkod till en ikon och beskrivning
const getWeatherIcon = (code: number): { icon: React.ReactNode; description: string } => {
    if (code === 0) return { icon: <IconSun className="w-10 h-10 text-yellow-400" />, description: 'Klart' };
    if (code >= 1 && code <= 3) return { icon: <IconCloud className="w-10 h-10 text-gray-400" />, description: 'Molnigt' };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: <IconCloudRain className="w-10 h-10 text-blue-400" />, description: 'Regn' };
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { icon: <IconSnowflake className="w-10 h-10 text-white" />, description: 'Snö' };
    return { icon: <IconCloud className="w-10 h-10 text-gray-500" />, description: 'Väder' };
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather');
        if (!response.ok) {
          throw new Error('Nätverksfel vid hämtning av väderdata.');
        }
        const data = await response.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between min-h-[92px]">
        {loading && <p className="text-gray-400 w-full text-center">Laddar väder...</p>}
        {error && <p className="text-red-400 w-full text-center">Kunde inte ladda väder</p>}
        {weather && (
            <div className="flex items-center gap-4 w-full animate-fade-in-fast">
                <div className="flex-shrink-0">
                    {getWeatherIcon(weather.weathercode).icon}
                </div>
                <div className="flex-grow">
                    <p className="text-gray-400 text-sm">Väder i Stockholm</p>
                    <p className="text-2xl font-bold text-white">{Math.round(weather.temperature)}°C</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-sm flex items-center gap-1.5"><IconWind className="w-4 h-4" /> {weather.windspeed} m/s</p>
                     <p className="text-gray-400 text-sm">{getWeatherIcon(weather.weathercode).description}</p>
                </div>
            </div>
        )}
    </div>
  );
}
