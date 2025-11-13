/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // GULDSTANDARD-FIX 8.0: Lägger till en överdrivet explicit URL med port 443.
  // Detta är ett sista försök att säkerställa att Next.js kan matcha ursprunget
  // exakt i Cloud Workstations-miljön.
  allowedDevOrigins: [
    "https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
    "http://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
    "https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev:443"
  ],

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
