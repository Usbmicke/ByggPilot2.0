
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { listCustomers } from './actions';
import { Customer } from '@/types/index';
import { logger } from '@/lib/logger';

export default async function CustomerListPage() {
  const session = await getServerSession();
  const userId = session?.user?.id;
  
  let customers: Customer[] = [];
  if (userId) {
    try {
      customers = await listCustomers(userId);
    } catch (error) {
      logger.error({ error }, "Kunde inte hämta kunder:");
      return <p className="text-red-500">Ett fel uppstod vid hämtning av kunder.</p>;
    }
  }

  return (
    <div>
      {customers.length === 0 ? (
        <div className="text-center py-12 bg-transparent rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-text-primary">Inga kunder hittades</h2>
          <p className="text-text-secondary mb-4">Kom igång genom att lägga till din första kund via knappen i menyn.</p>
        </div>
      ) : (
        <div className="bg-transparent shadow-md rounded-lg">
          <ul className="divide-y divide-border-primary">
            {customers.map((customer) => (
              <li key={customer.id} className="px-6 py-4 flex items-center justify-between hover:bg-background-secondary rounded-lg">
                <div>
                  <p className="font-semibold text-lg text-text-primary">{customer.name}</p>
                  <p className="text-sm text-text-secondary">{customer.email || 'E-post saknas'}</p>
                  <p className="text-sm text-text-secondary">{customer.phone || 'Telefon saknas'}</p>
                </div>
                <div className="flex items-center space-x-4">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.isCompany ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {customer.isCompany ? 'Företag' : 'Privat'}
                  </span>
                  <Link href={`/customers/${customer.id}/edit`} passHref>
                    <button className="text-sm text-accent-blue hover:text-accent-blue-dark font-medium">Redigera</button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
