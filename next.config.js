/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configuration for Next.js Image Optimization
    // We can leave this empty for now, as simply having the block
    // can often resolve base-level loading issues. We can add specific
    // domains here if we need to load images from external sources later.
  },
  experimental: {
      // This addresses the warning from the startup log, ensuring stable
      // connection to the development server from the cloud workstation URL.
      allowedDevOrigins: ["https://3001-firebase-byggpilot4-1761576395592.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev"],
  },
};

module.exports = nextConfig;
