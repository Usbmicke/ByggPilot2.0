
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
  // Denna inställning är nödvändig för att tillåta realtidsuppdateringar (Fast Refresh)
  // att fungera korrekt i Cloud Workstations utvecklingsmiljö, som använder en proxy.
  experimental: {
    // VIKTIGT: Denna lista måste synkroniseras med den URL som din Cloud Workstation använder.
    // Varningen i loggarna talar om exakt vilken URL som ska läggas till här.
    allowedDevOrigins: ["https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev"],
  },
};

export default nextConfig;
