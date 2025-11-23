
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
   * GULDSTANDARD v5.0: Konfiguration för att köra Genkit INOM Next.js-processen.
   * Detta instruerar Next.js att INTE försöka paketera vissa Genkit- och gRPC-moduler.
   * Dessa moduler är avsedda att köras på servern och Next.js ska lämna dem ifred.
   * Detta löser 'Module not found: Can\'t resolve (<dynamic> | \'undefined\')'-felet.
   */
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (isServer) {
      config.externals.push(
        '@genkit-ai/core',
        '@genkit-ai/flow',
        '@grpc/grpc-js',
        '@google-cloud/functions-framework'
      );
    }
    return config;
  },
  /**
   * Tystar Turbopack-varningen. Next.js 16 aktiverade Turbopack som standard, 
   * och det klagar på att vi har en webpack-konfiguration men ingen Turbopack-konfiguration.
   * En tom konfiguration är tillräckligt för att lösa detta.
   */
  turbopack: {},
};

export default nextConfig;
