import Link from 'next/link';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mina Projekt</h1>
        <Link href="/projects/new" passHref>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Skapa Nytt Projekt
          </button>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
