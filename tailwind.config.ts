
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
        // Definiera den nya, professionella färgpaletten
        'background-primary': '#1A1A1A', // Mörk, mjuk grå (ersätter kolsvart)
        'background-secondary': '#2C2C2C', // Något ljusare grå för kort
        'text-primary': '#E0E0E0',       // Bruten vit/off-white för text
        'text-secondary': '#A0A0A0',      // Mörkare grå för sekundär text
        'border-primary': '#404040',       // Kantlinjefärg
        'accent-blue': '#3B82F6',        // Dovblå primär accentfärg (ersätter cyan)

        // Statusfärger för projektkort
        'status-gold': '#FFD700',      // Guld för positiv status
        'status-red': '#DC2626',       // Röd för varningsstatus
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
