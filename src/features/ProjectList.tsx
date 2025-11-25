''''use client';

import { Button } from '@/shared/ui/button';

// This is a "dumb" component. It receives data and renders it.
// In the future, this data will be fetched via a Genkit flow and passed as a prop.
const projects = [
  { id: '1', name: 'Projekt Kv. Grävlingen', lastActivity: '2 timmar sedan' },
  { id: '2', name: 'Projekt BRF Solrosen', lastActivity: '1 dag sedan' },
  { id: '3', name: 'Projekt Villa Eken', lastActivity: '3 dagar sedan' },
];

export function ProjectList() {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-accent transition-colors">
          <div>
            <h3 className="font-medium text-primary-foreground">{project.name}</h3>
            <p className="text-sm text-muted-foreground">Senast aktivitet: {project.lastActivity}</p>
          </div>
          <Button variant="secondary">Öppna</Button>
        </div>
      ))}
    </div>
  );
}
'''