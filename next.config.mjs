
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
   * GULDSTANDARD v9.0: Korrekt konfiguration för Next.js 16 (Turbopack).
   * Vi använder `serverExternalPackages` för att instruera Turbopack att inte
   * bunta server-specifika bibliotek som Genkit. Detta är den moderna,
   * korrekta metoden och eliminerar behovet av en anpassad `webpack`-konfiguration.
   */
  serverExternalPackages: [
    '@genkit-ai/core',
    '@genkit-ai/flow',
    '@genkit-ai/firebase',
    '@genkit-ai/googleai',
    '@grpc/grpc-js', // Kritiskt beroende för Firebase/Google-SDKs
    '@google-cloud/functions-framework', // Ofta ett dolt beroende
  ],
};

export default nextConfig;
