
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProjects } from "@/actions/projectActions";
import ProjectList from "./ProjectList"; // Klientkomponent som vi skapar härnäst
import Header from '@/components/layout/Header';
import CreateNewMenu from '@/components/layout/CreateNewButton';

// Server Component för att hämta projektdata
export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div className="p-8 text-white">Du måste vara inloggad för att se denna sida.</div>;
  }

  // Anropa vår Guldstandard Server Action för att hämta projekt
  const { projects, error } = await getProjects(session.user.id);

  if (error) {
    return <div className="p-8 text-red-400">Fel: {error}</div>;
  }

  return (
    <div className="space-y-6">
        <Header title="Projekt">
            <CreateNewMenu />
        </Header>
        <main className="p-8 pt-0">
            <ProjectList initialProjects={projects || []} />
        </main>
    </div>
  );
}
