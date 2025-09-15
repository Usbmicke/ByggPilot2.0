import Link from 'next/link';

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mina Kunder</h1>
        <Link href="/customers/new" passHref>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Lägg Till Ny Kund
          </button>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
