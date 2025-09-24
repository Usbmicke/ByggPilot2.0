
import { ProjectList } from "@/app/components/dashboard/ProjectList";
import TodoList from "@/app/components/dashboard/TodoList";
import WeatherWidget from "@/app/components/dashboard/WeatherWidget";
import TimeLogger from "@/app/components/dashboard/TimeLogger";

export default function DashboardPage() {
  return (
    // Huvud-grid för layouten. All yttre padding har tagits bort härifrån
    // och hanteras nu enbart av `(main)/layout.tsx` för enhetlighet.
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Vänsterkolumn (tar upp 2/3 av bredden på större skärmar) */}
      <div className="lg:col-span-2 space-y-8">
        <TimeLogger />
        <WeatherWidget />
        <TodoList />
        <ProjectList />
      </div>

      {/* 
        Högerkolumnen är nu tom. Chatt-funktionen hanteras 
        exklusivt av den globala `ChatWidget`-komponenten i layouten,
        vilket löser en bugg med dubbla chatt-instanser.
      */}
      <div className="lg:col-span-1">
        {/* Denna div kan användas för framtida sticky-element om det behövs */}
        <div className="sticky top-8">
            {/* Tom för nu, chatten lever i ChatWidget */}
        </div>
      </div>

    </div>
  );
}
