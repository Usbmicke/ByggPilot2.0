import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { listCustomers } from '@/app/services/customerService';
import { Customer } from '@/app/types';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Korrekt sökväg

export default async function CustomerListPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  let customers: Customer[] = [];
  if (userId) {
    try {
      customers = await listCustomers(userId);
    } catch (error) {
      console.error("Kunde inte hämta kunder:", error);
      // Visa ett felmeddelande till användaren
      return <p className="text-red-500">Ett fel uppstod vid hämtning av kunder.</p>;
    }
  }

  return (
    <div>
      {customers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Inga kunder hittades</h2>
          <p className="text-gray-500 mb-4">Kom igång genom att lägga till din första kund.</p>
          <Link href="/customers/new" passHref>
             <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Skapa Kund
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg">
          <ul className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <li key={customer.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-lg text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email || 'E-post saknas'}</p>
                  <p className="text-sm text-gray-600">{customer.phone || 'Telefon saknas'}</p>
                </div>
                <div className="flex items-center space-x-4">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.isCompany ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {customer.isCompany ? 'Företag' : 'Privat'}
                  </span>
                  <Link href={`/customers/${customer.id}/edit`} passHref>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Redigera</button>
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
