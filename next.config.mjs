/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    // Lägger till den EXAKTA URL:en från felloggen som en felsäkerhetsåtgärd.
    "https://3000-firebase-byggpilot20-1756468240422.cluster-ha3ykp7smfgsutjta5qfx7ssnm.cloudworkstations.dev",
    // Behåller wildcard som en mer generell fallback.
    "https://*.cloudworkstations.dev",
  ],
};

export default nextConfig;
