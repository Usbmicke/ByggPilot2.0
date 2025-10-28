// app/customers/new/page.tsx

import { createCustomerAction } from './actions';

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Skapa Ny Kund</h2>
      <form action={createCustomerAction} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Kundnamn (Företag eller Privatperson)</label>
          <input id="name" name="name" type="text" placeholder="t.ex. Bygg AB eller Anna Andersson" required 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-post</label>
          <input id="email" name="email" type="email" placeholder="kontakt@byggab.se" 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefonnummer</label>
          <input id="phone" name="phone" type="tel" placeholder="070-123 45 67" 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="flex items-center space-x-2">
          <input id="isCompany" name="isCompany" type="checkbox" 
                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
          <label htmlFor="isCompany" className="text-sm font-medium text-gray-700">Är kunden ett företag?</label>
        </div>
        
        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Spara Kund
          </button>
        </div>

      </form>
    </div>
  );
}
