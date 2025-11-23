
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /**
   * GULDSTANDARD v5.2: Korrekt konfiguration för Turbopack.
   * Istället för den ineffektiva `webpack`-konfigurationen använder vi
   * `serverComponentsExternalPackages` för att instruera Turbopack att INTE
   * paketera de specificerade server-side biblioteken.
   * Detta löser de ihållande 'Module not found'-felen.
   */
  experimental: {
    serverComponentsExternalPackages: [
      '@genkit-ai/core',
      '@genkit-ai/flow',
      '@genkit-ai/firebase', // Inkludera baspaketen
      '@genkit-ai/googleai',
      '@grpc/grpc-js',
      '@google-cloud/functions-framework',
    ],
  },
};

export default nextConfig;
