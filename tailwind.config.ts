
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
        // NY FÄRGPALETT: Neutral gråskala för en lugn och professionell känsla
        'background-primary': '#18181b', // Mörk, neutral "Zinc 900"
        'background-secondary': '#27272a', // Något ljusare "Zinc 800" för kort och menyer
        'text-primary': '#f4f4f5',       // Mjuk vit "Zinc 100"
        'text-secondary': '#a1a1aa',      // Dämpad grå "Zinc 400" för sekundär text
        'border-primary': '#3f3f46',       // En tydlig grå kantlinje "Zinc 700"
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
