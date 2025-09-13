
import ImportantEvents from '@/app/components/dashboard/ImportantEvents';
import ProjectChecklist from '@/app/components/dashboard/ProjectChecklist';
import RecentProjects from '@/app/components/dashboard/RecentProjects';

export default function DashboardPage() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-2">Kontrollcenter</h1>
      <p className="text-gray-500 mb-8">En samlad överblick av dina projekt, uppgifter och viktiga händelser.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Huvudkolumn */}
        <div className="lg:col-span-2 space-y-6">
          <ImportantEvents />
          <RecentProjects />
        </div>

        {/* Sidokolumn */}
        <div className="lg:col-span-1">
          <ProjectChecklist />
        </div>

      </div>
    </main>
  );
}
