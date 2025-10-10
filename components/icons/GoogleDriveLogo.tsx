
import React from 'react';

// =================================================================================
// GULDSTANDARD: IKON-KOMPONENT
// Enkel, återanvändbar SVG-ikon för Google Drive.
// =================================================================================

export const GoogleDriveLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
        <path fill="#3777e3" d="M288 32l-128 224h128l128-224z"/>
        <path fill="#fcc400" d="M96 256l-64 112 128 224 64-112z"/>
        <path fill="#00a14b" d="M224 480l-128-224h384l-128 224z"/>
    </svg>
);
