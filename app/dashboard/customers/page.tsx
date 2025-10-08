
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCustomers } from "@/actions/customerActions";
import CustomerList from "./CustomerList"; // Vi skapar denna klientkomponent härnäst
import { PlusIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/dashboard/Header';
import { CreateNewMenu } from '@/components/dashboard/CreateNewMenu';

// Detta är en Server Component, den körs på servern.
export default async function CustomersPage() {
  const session = await getServerSession(authOptions);

  // Om ingen session finns, rendera ingenting (eller en felkomponent)
  if (!session?.user?.id) {
    return <div className="p-8 text-white">Du måste vara inloggad för att se denna sida.</div>;
  }

  // Hämta data direkt på servern med vår Guldstandard Server Action
  const { data: customers, error } = await getCustomers(session.user.id);

  if (error) {
    return <div className="p-8 text-red-400">Fel: {error}</div>;
  }

  return (
    <div className="space-y-6">
        <Header title="Kunder">
            <CreateNewMenu />
        </Header>
        <main className="p-8 pt-0">
            <CustomerList initialCustomers={customers || []} />
        </main>
    </div>
  );
}
