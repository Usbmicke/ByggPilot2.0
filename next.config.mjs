/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GULDSTANDARD-FIX 2.0: Korrigerat värde utan protokoll (`https://`).
  // Detta är det korrekta formatet enligt Next.js dokumentation.
  allowedDevOrigins: ["3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev"],
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
