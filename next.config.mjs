/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['firebase', 'firebase-admin'],
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
