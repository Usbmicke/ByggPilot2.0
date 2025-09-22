/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // LÄGG TILL DENNA DEL FÖR ATT HANTERA CROSS-ORIGIN VARNINGEN
  experimental: {
    allowedDevOrigins: ["https://3001-firebase-byggpilot20-1756468240422.cluster-ha3ykp7smfgsutjta5qfx7ssnm.cloudworkstations.dev"],
  },
};

module.exports = nextConfig;