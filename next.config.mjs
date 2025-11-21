
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Korrekt placering för allowedDevOrigins som en toppnivå-nyckel.
  // Detta är nödvändigt för att tillåta realtidsuppdateringar (Fast Refresh)
  // att fungera korrekt i Cloud Workstations utvecklingsmiljö, som använder en proxy.
  allowedDevOrigins: ["https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev"],
};

export default nextConfig;
