
import Chat from "@/app/components/Chat";
import ProjectList from "@/app/components/dashboard/ProjectList";
import TodoList from "@/app/components/dashboard/TodoList";
import WeatherWidget from "@/app/components/dashboard/WeatherWidget"; // Importera den nya komponenten

export default function DashboardPage() {
  return (
    // Använder den centrerade layout-containern som vi skapade tidigare
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Huvud-grid för layouten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Vänsterkolumn (tar upp 2/3 av bredden på större skärmar) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Väder-widgeten har lagts till här, högst upp */}
          <WeatherWidget />
          <TodoList />
          <ProjectList />
        </div>

        {/* Högerkolumn (tar upp 1/3 av bredden) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
             <Chat />
          </div>
        </div>

      </div>
    </div>
  );
}
