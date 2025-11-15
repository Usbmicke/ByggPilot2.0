/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: [
      "https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*", 
        destination: "https://byggpilot-v2.firebaseapp.com/__/auth/:path*",
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
