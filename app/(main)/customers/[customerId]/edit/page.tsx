
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { getCustomer } from '../../actions'; // KORRIGERAD IMPORT
import { notFound } from 'next/navigation';
import { updateCustomerAction, archiveCustomerAction } from './actions';

interface EditCustomerPageProps {
  params: {
    customerId: string;
  };
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { customerId } = params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Autentisering krävs.</p>;
  }

  const customer = await getCustomer(customerId, userId);

  if (!customer) {
    notFound();
  }

  const updateActionWithId = updateCustomerAction.bind(null, customerId);
  const archiveActionWithId = archiveCustomerAction.bind(null, customerId);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      <div>
        <h2 className="text-2xl font-semibold mb-6">Redigera Kund</h2>
        <form action={updateActionWithId} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
           <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Namn</label>
          <input id="name" name="name" type="text" required defaultValue={customer.name}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-post</label>
          <input id="email" name="email" type="email" defaultValue={customer.email || ''}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon</label>
          <input id="phone" name="phone" type="text" defaultValue={customer.phone || ''}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div className="flex items-center">
          <input id="isCompany" name="isCompany" type="checkbox" defaultChecked={customer.isCompany}
                 className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
          <label htmlFor="isCompany" className="ml-2 block text-sm text-gray-900">Är företagskund</label>
        </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
              Spara Ändringar
            </button>
          </div>
        </form>
      </div>

      <div className="border-t pt-8">
         <h3 className="text-xl font-semibold text-yellow-700">Arkiveringszon</h3>
         <div className="mt-4 bg-yellow-50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-medium text-yellow-800">Arkivera denna kund</p>
                <p className="text-sm text-yellow-700">Arkiverade kunder visas inte i listor men sparas för redovisning. Detta kan inte ångras direkt.</p>
            </div>
            <form action={archiveActionWithId}>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md">
                    Arkivera kund
                </button>
            </form>
         </div>
      </div>

    </div>
  );
}
