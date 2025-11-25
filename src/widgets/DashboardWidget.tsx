''''use client';

import { ProjectList } from '@/features/ProjectList';
import { Button } from '@/shared/ui/button';

/**
 * This widget composes the main dashboard view.
 * It sets up the layout but delegates the actual project listing
 * to the ProjectList feature component.
 */
export function DashboardWidget() {
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Nytt Projekt</Button>
      </header>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-foreground mb-4">Mina Projekt</h2>
        <ProjectList />
      </div>
    </div>
  );
}
'''