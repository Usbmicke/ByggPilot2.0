'use client';

import Link from 'next/link';

const Hero = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-950 text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Bygg smartare, inte hårdare
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
              ByggPilot är det enda verktyget du behöver för att hantera allt från offert till faktura. Spara tid, minska stress och öka lönsamheten.
            </p>
          </div>
          <div className="space-x-4">
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-md bg-cyan-500 px-8 text-sm font-medium text-gray-900 shadow transition-colors hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-700 disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Börja Gratis
            </Link>
            <Link
              href="#features"
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-800 bg-transparent px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Läs Mer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
