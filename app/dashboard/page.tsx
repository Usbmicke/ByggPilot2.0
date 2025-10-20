
import { AI } from '@/lib/chat/actions';
import { Chat } from '@/components/chat/chat';

// =================================================================================
// DASHBOARD PAGE V2.0 - REFAKTORERAD (GULDSTANDARD)
// BESKRIVNING: Denna version av dashboarden är helt ombyggd för att centrera kring
// den AI-drivna chattupplevelsen. Den gamla, statiska layouten med kort är
// borttagen. Istället används AI-providern för att möjliggöra ett dynamiskt
// och interaktivt gränssnitt där all funktionalitet utgår från chatten.
// =================================================================================

export default function DashboardPage() {
    return (
        <AI>
            <Chat />
        </AI>
    );
}
