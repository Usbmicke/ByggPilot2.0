import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Aktiverar dark mode-stöd
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // =========================================================================
        // == BYGGPILOT CLEAN UI / V2 DESIGN SYSTEM ================================
        // =========================================================================

        // -- Bakgrunder --
        'background-primary': 'var(--background-primary)',   // Djup, nästan svart: hsl(220 26% 8%)
        'background-secondary': 'var(--background-secondary)', // Mörkgrå för kort, menyer: hsl(220 18% 12%)
        'background-tertiary': 'var(--background-tertiary)', // Ljusare grå för hover/aktiva element: hsl(220 18% 16%)

        // -- Kanter (Borders) --
        'border-color': 'var(--border-color)',         // Subtil kantlinje: hsl(220 15% 20%)

        // -- Text --
        'text-primary': 'var(--text-primary)',           // Primär text, mjuk vit: hsl(210 20% 95%)
        'text-secondary': 'var(--text-secondary)',      // Sekundär text, dämpad grå: hsl(216 10% 60%)

        // -- Primär Accentfärg ("Brand") --
        'primary': 'var(--primary)',                       // Den nya, eleganta cyan-färgen: hsl(190 80% 65%)
        'primary-foreground': 'var(--primary-foreground)', // Textfärg för knappar: hsl(220 25% 10%)

        // -- Sekundär Accentfärg --
        'secondary': 'var(--secondary)',                   // För mindre viktiga knappar/tags: hsl(220 18% 16%)
        'secondary-foreground': 'var(--secondary-foreground)', // Text för sekundära element: hsl(210 20% 95%)
        
        // -- Statusfärger (Semantiska) --
        'destructive': 'var(--destructive)', // Röd för fel/varningar: hsl(0 63% 50%)
        'destructive-foreground': 'var(--destructive-foreground)', // Text för destruktiva element: hsl(210 20% 95%)
        'success': 'var(--success)', // Grön för framgång: hsl(142 60% 45%)
        'warning': 'var(--warning)', // Gul för varningar: hsl(48 90% 50%)
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
