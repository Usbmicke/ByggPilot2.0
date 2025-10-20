'use client';

import { useUI } from '@/contexts/UIContext';
import { FaCommentDots } from 'react-icons/fa'; // Importerar en lämplig ikon

// =================================================================================
// CHAT BUBBLE V1.0 - FÖRSTA IMPLEMENTATION
// SYFTE: Denna komponent är den ständigt närvarande bubblan som användaren
// klickar på för att öppna och stänga själva chattfönstret.
// =================================================================================

const ChatBubble = () => {
  const { isChatOpen, toggleChat } = useUI();

  return (
    <button 
      onClick={toggleChat} 
      className="fixed bottom-8 right-8 bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-transform transform hover:scale-110 z-50"
      aria-label="Öppna chatt"
    >
      <FaCommentDots size={24} />
    </button>
  );
}

export default ChatBubble;
