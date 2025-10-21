
'use client';

import { Menu, Bell } from 'lucide-react'; // ÅTERSTÄLLT: Använder Bell för notiser
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/layout/UserMenu';

// =================================================================================
// HEADER (v4.0 - "OPERATION RÄTT CHATT")
// Beskrivning: En version som återställer aviseringsklockan och tar bort all chattlogik.
// Headern ska INTE längre ansvara för att öppna någon chatt.
// =================================================================================

interface HeaderProps {
  onMenuClick: () => void;
  // onChatClick är medvetet borttagen
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 z-30 bg-background-primary/80 backdrop-blur-sm border-b border-border h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Översikt</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* ---- AVISERINGSKLOCKA (ÅTERSTÄLLD) ---- */}
        <Button
          variant="ghost"
          size="icon"
          // onClick för notispanel kan läggas till här i framtiden
          className="text-text-secondary hover:text-text-primary"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Visa notiser</span>
        </Button>
        
        <UserMenu />
      </div>
    </header>
  );
}
