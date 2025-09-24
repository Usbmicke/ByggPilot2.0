
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ÅTERSTÄLLD: Den klassiska blå färgpaletten för ByggPilot
        'background-primary': '#0F172A', // Mörkblå "Natt-himmel" för huvudbakgrunden
        'background-secondary': '#1E293B', // Något ljusare "Skymningsblå" för sidomeny och kort
        'text-primary': '#F1F5F9',       // Klar vit med en gnutta blått
        'text-secondary': '#94A3B8',      // Dämpad blå-grå för sekundär text
        'border-primary': '#334155',       // En tydlig blå-grå kantlinje
        'accent-blue': '#3B82F6',        // Behåller den starka och klara accent-blå för knappar

        // Statusfärger (behålls som de är)
        'status-gold': '#FFD700',
        'status-red': '#DC2626',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
