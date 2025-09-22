import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dov, professionell baspalett
        'background-primary': '#1A202C',   // Mörkt blågrå
        'background-secondary': '#2D3748', // Gråblå
        'border-primary': '#4A5568',       // Mellangrå
        'text-primary': '#F7FAFC',         // Nästan vit
        'text-secondary': '#A0AEC0',       // Ljusgrå
        
        // Tydlig accent- & status-palett
        'accent-blue': '#3182CE',          // Klar blå
        'accent-gold': '#B79434',          // Muted Guld/Ockra
        'status-green': '#38A169',         // Grön
        'status-red': '#E53E3E',           // Röd
      }
    },
  },
  plugins: [],
};
export default config;
