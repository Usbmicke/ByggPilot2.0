
'use client';

import React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
}

// Enkel, återanvändbar Popover-komponent byggd ovanpå Radix UI.
const Popover: React.FC<PopoverProps> = ({ trigger, content }) => {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content 
            sideOffset={5} 
            className="rounded-md p-3 max-w-xs bg-background-tertiary border border-border-primary shadow-md z-50 animate-in fade-in-0 zoom-in-95"
        >
          {content}
          <RadixPopover.Arrow className="fill-current text-border-primary" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};

export default Popover;
