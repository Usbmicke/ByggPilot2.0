
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1E1F22', // Mörk grå, nästan svart
        card: '#2B2D31',       // Ljusare grå för kort
        primary: '#4A90E2',     // Dämpad blå
        'primary-hover': '#5A98E4', // Ljusare blå för hover
        foreground: '#F2F3F5',   // Ljusgrå text
        'muted-foreground': '#B9BBBE', // Mörkare, mindre viktig text
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
