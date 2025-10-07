
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
        // Ny monokrom palett baserad på Zinc
        'background-primary': '#18181b', // Tailwind Zinc 900
        'component-background': '#27272a', // Tailwind Zinc 800
        'border': '#3f3f46', // Tailwind Zinc 700
        
        // Ny, sofistikerad accentfärg
        'accent': '#5E615D', // Dämpad grå-grön

        // Typografi
        'text-primary': '#f4f4f5', // Tailwind Zinc 100
        'text-secondary': '#a1a1aa', // Tailwind Zinc 400

        // Statusfärger (behålls som de är för funktionell igenkänning)
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
