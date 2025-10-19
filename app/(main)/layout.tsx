import React from 'react';

// =================================================================================
// GULDSTANDARD: Main App Layout v3.0 - MED CO-PILOT
// BESKRIVNING: Denna layout integrerar nu den nya <Chat /> komponenten.
// Co-Piloten blir därmed en fundamental och ständigt närvarande del av 
// användarupplevelsen, precis som Guldstandard-planen föreskriver.
// =================================================================================

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      {/* Huvudinnehållet i applikationen */}
      <main>{children}</main>

    </div>
  );
}
