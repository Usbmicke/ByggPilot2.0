import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/(public)/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/(private)/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/(private)/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/(private)/dashboard/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
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
