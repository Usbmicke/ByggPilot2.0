import { getServerSession } from '@/app/lib/auth';
import { listCustomers } from '@/app/services/customerService';
import { createProjectAction } from './actions';
import { Customer } from '@/app/types';

export default async function NewProjectPage() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Du måste vara inloggad.</p>;
  }

  const customers = await listCustomers(userId);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Skapa Nytt Projekt</h1>

      {customers.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        Du måste ha minst en kund för att kunna skapa ett projekt. 
                        <a href="/customers/new" className="font-medium underline text-yellow-800 hover:text-yellow-900">Skapa en kund nu</a>.
                    </p>
                </div>
            </div>
        </div>
      ) : (
        <form action={createProjectAction} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
          
          {/* Kundval */}
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Välj Kund</label>
            <select id="customerId" name="customerId" required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
              {customers.map((customer: Customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>

          {/* Projektnamn */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Projektnamn</label>
            <input id="name" name="name" type="text" required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>

          {/* Adress */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adress</label>
            <input id="address" name="address" type="text"
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Tidsfrist (valfritt)</label>
            <input id="deadline" name="deadline" type="date"
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
             <p className="mt-2 text-xs text-gray-500">Ange ett slutdatum för projektet. Detta hjälper ByggPilot att övervaka projektets hälsa.</p>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
              Skapa Projekt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
