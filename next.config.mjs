
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: [
    "wss://*.cloudworkstations.dev",
    "https://*.cloudworkstations.dev",
    "http://localhost:3000",
    "http://localhost:3001"
  ],

  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://byggpilot-v2.firebaseapp.com/__/auth/:path*",
      },
    ];
  },

  // DIAGNOSTISKT STEG: Lägger till ett test-huvud för att verifiera att filen läses.
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          // TEST-HEADER: Om detta huvud syns i webbläsaren, vet vi att konfigurationsfilen har laddats.
          {
            key: 'X-Config-Status',
            value: 'Loaded',
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
