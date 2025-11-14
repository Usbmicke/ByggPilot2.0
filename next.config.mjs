/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // FIX FÖR "Blocked cross-origin request"
  allowedDevOrigins: [
    "https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
    "http://localhost:3000",
    "http://localhost:3001"
  ],

  // FIX FÖR ATT FIREBASE-INLOGGNING SKA HITTAS
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*", // MÅSTE ha dubbla understreck
        destination: "https://byggpilot-v2.firebaseapp.com/__/auth/:path*", // MÅSTE ha dubbla understreck
      },
    ];
  },

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
};

export default nextConfig;
