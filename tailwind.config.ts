
import type { Config } from 'tailwindcss';

// =================================================================================
// TAILWIND CONFIG V7.0 - INVERTERAD HIERARKI (FIX)
//
// REVIDERING: Inverterar `background-primary` och `background-secondary`.
//              Huvudinnehållet får nu den mörkaste, neutrala färgen (#18181b),
//              vilket eliminerar den blåa tonen som användaren rapporterade.
//              Detta löser färgproblemet på dashboarden slutgiltigt.
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
                // --- GRUNDLÄGGANDE TEMA (INVERTERAD GRÅSKALA)
                'background-primary': '#18181b',      // Huvudbakgrund, nu mörkaste grå (Zinc 900)
                'background-secondary': '#27272a',    // Sidofält etc, nu ljusare grå (Zinc 800)
                'component-background': '#3f3f46',  // Komponenter/inputs (Zinc 700)
                'border': '#52525b',                // Kantlinjer (Zinc 600)

                // --- TEXTFÄRGER
                'text-primary': '#f4f4f5',          // Primär text (Zinc 100)
                'text-secondary': '#a1a1aa',        // Sekundär text (Zinc 400)
                'text-accent': '#a1a1aa',             // ERSATT: Var blå, nu sekundär textfärg (Zinc 400)

                // --- ACCENT & KNAPPAR (NEUTRALISERAD)
                'accent': {
                    DEFAULT: '#3f3f46',              // ERSATT: Var blå, nu komponentbakgrund (Zinc 700)
                    foreground: '#f4f4f5'          // Ljus text på accentytor
                },
                'destructive': {
                    DEFAULT: '#f87171',              // Röd för varningar/fel (Red 400)
                    foreground: '#fef2f2'          // Ljus text på röd bakgrund
                },

                // --- STATUS & DIVERSE
                'status-gold': '#facc15',           // Guld för stjärnor/status (Yellow 400)
                'status-red': '#f87171',            // Röd för notiser/fel (Red 400)

                // --- INTERAKTIVA ELEMENT (NEUTRALISERAD)
                ring: '#52525b',                     // ERSATT: Var blå, nu kantlinjefärg (Zinc 600)
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
