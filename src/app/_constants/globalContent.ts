
import { ActionableEvent } from '@/lib/dal/dal'; // <-- KORRIGERAD IMPORT

/**
 * Denna fil innehåller statiskt innehåll som används på flera ställen i applikationen.
 * Att centralisera detta gör det enklare att hantera och uppdatera.
 */

// Statiskt "Proaktivt Tips" som en ActionableEvent. Datamodellen är nu harmoniserad.
export const PROACTIVE_TIP_EVENT: ActionableEvent = {
  id: 'static-tip-1', 
  createdAt: new Date(), 
  type: 'Tip', 
  title: 'Proaktivt Tips: Automatisk Riskanalys',
  description: 'Visste du att ByggPilot automatiskt skapar en initial riskanalys varje gång du skapar ett nytt projekt? Detta sparar tid och säkerställer att du omedelbart har en baslinje för KMA-arbetet.',
  link: '/knowledge-base/kma', // Länkar till relevant sida
  isRead: false,
};
