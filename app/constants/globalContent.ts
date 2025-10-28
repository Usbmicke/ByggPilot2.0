
import { ActionableEvent } from '@/app/types/index';

/**
 * Denna fil innehåller statiskt innehåll som används på flera ställen i applikationen.
 * Att centralisera detta gör det enklare att hantera och uppdatera.
 */

// Statiskt "Proaktivt Tips" som en ActionableEvent. Datamodellen är nu harmoniserad.
export const PROACTIVE_TIP_EVENT: ActionableEvent = {
  // Bas-Event fält
  id: 'static-tip-1', 
  date: new Date().toISOString(), 
  type: 'Tip', 
  title: 'Proaktivt Tips: Automatisk Riskanalys',
  description: 'Visste du att ByggPilot automatiskt skapar en initial riskanalys varje gång du skapar ett nytt projekt? Detta sparar tid och säkerställer att du omedelbart har en baslinje för KMA-arbetet.',
  iconName: 'FiZap',
  color: 'yellow',

  // ActionableEvent-specifika fält
  actionType: 'UNKNOWN', // Detta är ett tips, inte en konkret åtgärd
  suggestedNextStep: 'Läs mer i kunskapsbanken om KMA.',
};
