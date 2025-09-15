import { getServerSession } from '@/app/lib/auth';
import { listArchivedCustomers } from '@/app/services/customerService';
import { listArchivedProjects } from '@/app/services/projectService';
import { Customer, Project } from '@/app/types';

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Okänt datum';
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

export default async function ArchivePage() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Autentisering krävs.</p>;
  }

  const [archivedCustomers, archivedProjects] = await Promise.all([
    listArchivedCustomers(userId),
    listArchivedProjects(userId)
  ]);

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-gray-800">Arkiv</h1>

      {/* Arkiverade Kunder */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Arkiverade Kunder</h2>
        {archivedCustomers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {archivedCustomers.map((customer: Customer) => (
              <li key={customer.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <span className="text-sm text-gray-500">
                  Arkiverad: {formatDate(customer.archivedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Inga kunder har arkiverats.</p>
        )}
      </div>

      {/* Arkiverade Projekt */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Arkiverade Projekt</h2>
        {archivedProjects.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {archivedProjects.map((project: Project) => (
              <li key={project.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.customerName}</p>
                </div>
                <span className="text-sm text-gray-500">
                  Arkiverad: {formatDate(project.archivedAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Inga projekt har arkiverats.</p>
        )}
      </div>
    </div>
  );
}
