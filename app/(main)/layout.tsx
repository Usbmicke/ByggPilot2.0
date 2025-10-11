
import React from 'react';

// =================================================================================
// GULDSTANDARD: Main App Layout v2.0
// BESKRIVNING: Denna layout är nu en "dum" komponent. All logik för sessionhantering
// och routing har flyttats till rotlayouten (`app/layout.tsx`). Dess enda ansvar
// är att definiera den visuella strukturen för huvudapplikationen (t.ex. med sidomeny).
// =================================================================================

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      {/* Här skulle den visuella layouten för appen ligga, t.ex. sidomeny, header etc. */}
      {/* För nu renderar vi bara children direkt. */}
      {children}
    </div>
  );
}
