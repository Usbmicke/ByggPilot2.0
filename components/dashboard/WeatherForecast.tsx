'use client';

import { useEffect, useState } from 'react';

interface WeatherForecastProps {
  lat: number;
  lon: number;
}

interface DailyForecast {
  date: string;
  temp: number | string;
  icon: string;
}

const WeatherForecast = ({ lat, lon }: WeatherForecastProps) => {
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) {
      setLoading(false);
      setError('Missing coordinates');
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lon }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setForecast(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  if (error) {
    return <div className="text-xs text-red-500">Väder kunde inte laddas.</div>;
  }

  if (loading) {
    return <div className="text-xs text-gray-400">Laddar väder...</div>;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 mb-2">Prognos</h4>
      <div className="flex justify-between space-x-2">
        {forecast.map((day) => {
          const dayOfWeek = new Date(day.date).toLocaleDateString('sv-SE', { weekday: 'short' });
          return (
            <div key={day.date} className="flex flex-col items-center p-1 rounded-md bg-gray-50 flex-1">
              <span className="text-xs font-medium text-gray-600">{dayOfWeek}</span>
              <span className="text-xl">{day.icon}</span>
              <span className="text-sm font-bold">{day.temp}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherForecast;
