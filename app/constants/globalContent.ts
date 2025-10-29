
import { ActionableEvent } from '@/app/types/index';

/**
 * Denna fil innehåller statiskt innehåll som används på flera ställen i applikationen.
 * Att centralisera detta gör det enklare att hantera och uppdatera.
 */

// Statiskt "Proaktivt Tips" som en ActionableEvent. Datamodellen är nu harmoniserad.
// VÄRLDSKLASS-KORRIGERING: 'date' har bytts mot 'createdAt' och ogiltiga fält har tagits bort.
export const PROACTIVE_TIP_EVENT: ActionableEvent = {
  id: 'static-tip-1', 
  createdAt: new Date().toISOString(), 
  type: 'Tip', 
  title: 'Proaktivt Tips: Automatisk Riskanalys',
  description: 'Visste du att ByggPilot automatiskt skapar en initial riskanalys varje gång du skapar ett nytt projekt? Detta sparar tid och säkerställer att du omedelbart har en baslinje för KMA-arbetet.',
  link: '/knowledge-base/kma', // Länkar till relevant sida
  isRead: false,
  actionType: 'INFO', // Tydligare actionType
  suggestedNextStep: 'Läs mer i kunskapsbanken om KMA.',
};
