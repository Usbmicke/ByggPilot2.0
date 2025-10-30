
import { NextRequest, NextResponse } from 'next/server';

// GET-funktion för att hämta väderdata
export async function GET(request: NextRequest) {
    
    // Hårdkodade koordinater för Stockholm, Sverige. 
    // I framtiden kan detta göras dynamiskt baserat på projektplats eller användarinställning.
    const latitude = 59.3293;
    const longitude = 18.0686;

    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe/Stockholm`;

    try {
        const response = await fetch(weatherURL, {
            // Ställ in en kortare cache-tid för väderdata så att den är någorlunda aktuell.
            next: { revalidate: 3600 } // Uppdatera varje timme
        });

        if (!response.ok) {
            throw new Error(`Kunde inte hämta väderdata från Open-Meteo. Status: ${response.status}`);
        }

        const data = await response.json();

        // Mappa om svaret till ett enklare, mer kontrollerat format för vår frontend.
        const formattedWeather = {
            temperature: data.current_weather.temperature,
            weathercode: data.current_weather.weathercode,
            windspeed: data.current_weather.windspeed,
        };

        return NextResponse.json(formattedWeather);

    } catch (error: any) {
        console.error("Fel vid hämtning av väder:", error);
        return NextResponse.json({ message: "Internt serverfel vid hämtning av väderdata.", error: error.message }, { status: 500 });
    }
}
