
import { NextResponse } from 'next/server';

// SMHI Weather Symbol mapping
const SMHI_WEATHER_SYMBOLS: { [key: number]: string } = {
    1: '☀️', // Clear sky
    2: '🌤️', // Nearly clear sky
    3: '⛅️', // Variable cloudiness
    4: '🌥️', // Halfclear sky
    5: '☁️', // Cloudy sky
    6: '🌫️', // Overcast
    7: '🌫️', // Fog
    8: '🌦️', // Light rain showers
    9: '🌧️', // Moderate rain showers
    10: '⛈️', // Heavy rain showers
    11: '⛈️', // Thunderstorm
    12: '🌨️', // Light sleet showers
    13: '🌨️', // Moderate sleet showers
    14: '🌨️', // Heavy sleet showers
    15: '❄️', // Light snow showers
    16: '❄️', // Moderate snow showers
    17: '❄️', // Heavy snow showers
    18: '🌧️', // Light rain
    19: '🌧️', // Moderate rain
    20: '🌧️', // Heavy rain
    21: '⛈️', // Thunder
    22: '🌨️', // Light sleet
    23: '🌨️', // Moderate sleet
    24: '🌨️', // Heavy sleet
    25: '❄️', // Light snowfall
    26: '❄️', // Moderate snowfall
    27: '❄️'  // Heavy snowfall
};

/**
 * API endpoint to fetch weather forecast from SMHI for given coordinates.
 */
export async function POST(request: Request) {
  try {
    const { lat, lon } = await request.json();

    if (!lat || !lon) {
      return NextResponse.json({ message: 'Latitude and longitude are required.' }, { status: 400 });
    }

    // SMHI API endpoint for point forecast
    const smhiApiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;

    const response = await fetch(smhiApiUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SMHI API Error: ${response.status} ${errorText}`);
      return NextResponse.json({ message: `Failed to fetch data from SMHI: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();

    // --- Data Processing ---
    // Group parameters by validTime
    const dailyData: { [key: string]: { temp?: number; weatherSymbol?: number } } = {};

    for (const series of data.timeSeries) {
        const date = series.validTime.split('T')[0]; // Get YYYY-MM-DD

        if (!dailyData[date]) {
            dailyData[date] = {};
        }

        // Find temperature and weather symbol for this timestamp
        const tempParam = series.parameters.find((p: any) => p.name === 't');
        const weatherParam = series.parameters.find((p: any) => p.name === 'Wsymb2');

        // We will just take the noon (12:00) measurement for simplicity for now
        if (series.validTime.includes('T12:00:00Z')) {
             if (tempParam) dailyData[date].temp = tempParam.values[0];
             if (weatherParam) dailyData[date].weatherSymbol = weatherParam.values[0];
        }
    }
    
    // Format into a 7-day array
    const forecast = Object.entries(dailyData).slice(0, 7).map(([date, values]) => ({
      date,
      temp: values.temp ? Math.round(values.temp) : '-',
      icon: values.weatherSymbol ? SMHI_WEATHER_SYMBOLS[values.weatherSymbol] || '-' : '-',
    }));

    return NextResponse.json(forecast);

  } catch (error) {
    console.error("Error in weather API: ", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
