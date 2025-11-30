
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Konfiguration för att tillåta cross-origin-förfrågningar under utveckling
    // Detta är en rekommendation från Next.js-loggarna
    async headers() {
        return [
            {
                // Svara på alla sökvägar
                source: "/:path*",
                headers: [
                    // Tillåt begäranden från alla ursprung
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    // Ange tillåtna metoder
                    { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
                    // Ange tillåtna huvuden
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                ],
            },
        ];
    },
};

export default nextConfig;
