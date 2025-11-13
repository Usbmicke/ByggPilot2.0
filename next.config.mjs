/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // GULDSTANDARD-FIX 7.0: Lägger till en extra, mer explicit URL för att
  // säkerställa att absolut alla variationer av ursprunget är täckta.
  // Detta är för att utesluta alla möjliga konfigurationsfel.
  allowedDevOrigins: [
    "https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
    "http://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev"
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
