
import type { Config } from 'tailwindcss';

// =================================================================================
// TAILWIND CONFIG V5.0 - PLATINUM STANDARD (MJUK HIERARKI)
//
// REVIDERING: Färgerna för `background-primary` och `background-secondary` har
// inverterats. Huvudinnehållet (`primary`) är nu ljusare än sidofältet (`secondary`),
// vilket skapar en mjukare visuell hierarki och ett mer behagligt gränssnitt, helt
// i enlighet med användarens önskemål.
// =================================================================================

const config: Config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // --- GRUNDLÄGGANDE TEMA (NEUTRAL GRÅSKALA - JUSTERAD)
                'background-primary': '#27272a',      // Huvudbakgrund, ljusare grå (Zinc 800)
                'background-secondary': '#18181b',    // Sidofält etc, mörkaste grå (Zinc 900)
                'component-background': '#3f3f46',  // Komponenter/inputs (Zinc 700)
                'border': '#52525b',                // Kantlinjer (Zinc 600)

                // --- TEXTFÄRGER
                'text-primary': '#f4f4f5',          // Primär text (Zinc 100)
                'text-secondary': '#a1a1aa',        // Sekundär text (Zinc 400)
                'text-accent': '#60a5fa',             // Dov, blå accentfärg (Blue 400)

                // --- ACCENT & KNAPPAR (DOV BLÅ)
                'accent': {
                    DEFAULT: '#60a5fa',              // Dov, blå accent (Blue 400)
                    foreground: '#f4f4f5'          // Ljus text på accentytor
                },
                'destructive': {
                    DEFAULT: '#f87171',              // Röd för varningar/fel (Red 400)
                    foreground: '#fef2f2'          // Ljus text på röd bakgrund
                },

                // --- STATUS & DIVERSE
                'status-gold': '#facc15',           // Guld för stjärnor/status (Yellow 400)
                'status-red': '#f87171',            // Röd för notiser/fel (Red 400)

                // --- INTERAKTIVA ELEMENT (FÖR KOMPATIBILITET)
                ring: '#60a5fa',                     // Outline/ring vid fokus (Blue 400)
                input: '#52525b',                    // Kantlinje för input-fält (Zinc 600)
            },
            borderRadius: {
                lg: '0.75rem', // 12px
                md: '0.5rem',  // 8px
                sm: '0.375rem' // 6px
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
