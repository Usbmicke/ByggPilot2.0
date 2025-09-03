
import Image from "next/image";
import Link from "next/link";

// Definierar SVG-ikonkomponenter direkt i filen
const IconCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCode = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
  
  const IconCloud = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
  
  const IconDatabase = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
  
  const IconGitCommitVertical = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v6" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 15v6" />
    </svg>
  );
  
  const IconSearch = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white shadow-sm">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
            <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={140} height={40} />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Funktioner
          </Link>
          <Link href="#grundare" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Grundare
          </Link>
          <Link href="#pro-tips" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Tips för proffs
          </Link>
          <Link href="/dashboard" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors" prefetch={false}>
            Logga in
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                    Byggbranschens nya digitala co-pilot
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    ByggPilot är din intelligenta assistent som automatiserar, effektiviserar och optimerar dina
                    byggprojekt. Från start till mål, på ett och samma ställe.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/dashboard" className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" prefetch={false}>
                        Testa gratis
                    </Link>
                </div>
              </div>
              <div className="relative w-full h-64 lg:h-auto rounded-xl overflow-hidden">
                <Image
                  src="/images/byggpilot.png"
                  alt="Hero"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm">Nyckelfunktioner</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
                  Allt du behöver för ett framgångsrikt projekt
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ByggPilot kombinerar kraftfulla verktyg för att ge dig full kontroll och överblick, från första
                  offert till sista besiktning.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold flex items-center gap-2"><IconCheck className="w-5 h-5 text-blue-600" /> Projektledning</h3>
                      <p className="text-gray-600">
                        Skapa, hantera och följ upp alla dina projekt på ett ställe.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold flex items-center gap-2"><IconCheck className="w-5 h-5 text-blue-600" /> Dokumenthantering</h3>
                      <p className="text-gray-600">
                        Ladda upp, organisera och dela alla dina viktiga dokument säkert.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold flex items-center gap-2"><IconCheck className="w-5 h-5 text-blue-600" /> AI-assistent</h3>
                      <p className="text-gray-600">
                        Få intelligenta förslag och automatisera repetitiva uppgifter.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative w-full h-64 lg:h-auto rounded-xl overflow-hidden">
                <Image
                  src="/images/byggpilot.png"
                  alt="Features"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Grundare Section */}
        <section id="grundare" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="flex justify-center items-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                    <Image
                        src="/images/mickebild.png"
                        alt="Grundare Michael Fogelström Ekengren"
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-full shadow-xl"
                    />
                </div>
              </div>
              <div className="flex flex-col items-start justify-center space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Grundare</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Michael Fogelström Ekengren</h2>
                <p className="text-gray-600 md:text-xl/relaxed">
                  "Efter 15 år i branschen såg jag ett tydligt behov av ett digitalt verktyg som faktiskt förstår
                  hantverkares vardag. ByggPilot är resultatet av den insikten – ett system byggt för att förenkla,
                  inte komplicera."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-600">&copy; 2024 ByggPilot. Alla rättigheter förbehållna.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Användarvillkor
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Integritetspolicy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
