/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // GULDSTANDARD-FIX 3.0: Korrigerat domännamn och tillagt protokoll (`https://`).
  // Detta löser felet "Blocked cross-origin request".
  allowedDevOrigins: ["https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev"],

  // GULDSTANDARD-FIX 4.0: Återinfört proxy-regeln. Det är nu tydligt att
  // Metod A (authDomain i firebase-client) och Metod B (rewrites här)
  // måste samverka för att lösa både cookie- och 404-problemet.
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://byggpilot-v2.firebaseapp.com/__/auth/:path*",
      },
    ];
  },

  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
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
