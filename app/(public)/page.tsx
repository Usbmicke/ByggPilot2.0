
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <header className="absolute top-0 left-0 p-4">
        <img src="/byggpilot-logo.png" alt="ByggPilot Logo" className="h-12" />
      </header>
      <main className="text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
          Vi lanserar snart
        </h1>
        <p className="mt-4 text-lg md:text-xl">
          ByggPilot - din digitala arbetsledare. Vi är här för att förenkla och effektivisera ditt byggprojekt.
        </p>
        <a
          href="mailto:dinkontakt@byggpilot.se"
          className="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
        >
          Kontakta Oss
        </a>
      </main>
      <footer className="absolute bottom-0 p-4 text-sm">
        <p>&copy; 2025 ByggPilot. Alla rättigheter förbehållna.</p>
      </footer>
    </div>
  );
}
