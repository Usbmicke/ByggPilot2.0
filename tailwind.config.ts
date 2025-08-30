import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Denna rad täcker ALLA komponenter i din app
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0D1B2A',
        'brand-medium': '#1B263B',
        'brand-light': '#415A77',
        'brand-accent': '#778DA9',
        'brand-text': '#E0E1DD',
      }
    },
  },
  plugins: [],
};
export default config;