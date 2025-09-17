'use client';

import ProjectOverview from '@/app/components/dashboard/ProjectOverview';

/**
 * Huvudsidan för instrumentpanelen som visas efter att onboardingen är slutförd.
 * All logik för autentisering och status-kontroll hanteras nu av den övergripande layouten.
 */
export default function DashboardPage() {
  return <ProjectOverview />;
}
