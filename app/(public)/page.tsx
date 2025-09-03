
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

// --- Ikoner ---

const IconCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const IconX = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

const IconGavel = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9" /><path d="m15 13 6-6" /><path d="m11 9 6-6" /><path d="m3 21 6-6" /><path d="m18 8 3 3" /></svg>
);

const IconTrendingUp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
);

const IconMessageSquare = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);

const IconShieldAlert = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
);

const IconFileText = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
);

const IconBookOpen = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

const IconClipboardCheck = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>
);

const IconScale = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h18" /></svg>
);

// --- Huvudkomponent för Landningssidan ---

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <header className="px-4 lg:px-6 h-14 flex items-center bg-white shadow-sm">
            <Link href="#" className="flex items-center justify-center" prefetch={false}>
                <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={140} height={40} />
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>Funktioner</Link>
                <Link href="#grundare" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>Grundare</Link>
                <Link href="#pro-tips" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>Tips för proffs</Link>
                <Link href="/dashboard" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors" prefetch={false}>Logga in</Link>
            </nav>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                      Byggbranschens nya digitala co-pilot
                    </h1>
                    <p className="max-w-[600px] text-gray-600 md:text-xl">
                      ByggPilot är din intelligenta assistent som automatiserar, effektiviserar och optimerar dina byggprojekt. Från start till mål, på ett och samma ställe.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                      <Link href="/dashboard" className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" prefetch={false}>
                          Testa gratis
                      </Link>
                  </div>
                </div>
                <div className="relative w-full h-64 lg:h-auto rounded-xl overflow-hidden">
                  <Image src="/images/byggpilot.png" alt="Hero" fill style={{ objectFit: "cover" }} className="rounded-xl"/>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm">Nyckelfunktioner</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Allt du behöver för ett framgångsrikt projekt</h2>
                        <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            ByggPilot kombinerar kraftfulla verktyg för att ge dig full kontroll och överblick, från första offert till sista besiktning.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                    <div className="flex flex-col justify-center space-y-4">
                        <ul className="grid gap-6">
                            <li><div className="grid gap-1"><h3 className="text-xl font-bold flex items-center gap-2"><IconCheck className="w-5 h-5 text-blue-600" /> Projektledning</h3><p className="text-gray-600">Skapa, hantera och följ upp alla dina projekt på ett ställe.</p></div></li>
                            <li><div className="grid gap-1"><h3 className="text-xl font-bold flex items-center gap-2"><IconCheck className="w-5 h-5 text-blue-600" /> Dokumenthantering</h3><p className="text-gray-600">Ladda upp, organisera och dela alla dina viktiga dokument säkert.</p></div></li>
                            <li><div className="grid gap-1"><h3 className="text-xl font-bold flex items-center gap-2"><IconCheck className="w-5 h-5 text-blue-600" /> AI-assistent</h3><p className="text-gray-600">Få intelligenta förslag och automatisera repetitiva uppgifter.</p></div></li>
                        </ul>
                    </div>
                    <div className="relative w-full h-64 lg:h-auto rounded-xl overflow-hidden">
                        <Image src="/images/byggpilot.png" alt="Features" fill style={{ objectFit: "cover" }} className="rounded-xl"/>
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
                      <Image src="/images/mickebild.png" alt="Grundare Michael Fogelström Ekengren" fill style={{ objectFit: 'cover' }} className="rounded-full shadow-xl"/>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-center space-y-4">
                  <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Grundare</div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Michael Fogelström Ekengren</h2>
                  <p className="text-gray-600 md:text-xl/relaxed">
                    "Efter 15 år i branschen såg jag ett tydligt behov av ett digitalt verktyg som faktiskt förstår hantverkares vardag. ByggPilot är resultatet av den insikten – ett system byggt för att förenkla, inte komplicera."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pro Tips Section */}
          <section id="pro-tips" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
            <div className="container text-center px-4 md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tips för proffs</h2>
                    <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Lås upp kraften i ByggPilot med dessa experttips. Bli effektivare, smartare och mer lönsam.
                    </p>
                </div>
                <div className="mt-8">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Visa 9 tips från experter
                    </button>
                </div>
            </div>
           </section>
        </main>

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
          <p className="text-xs text-gray-600">&copy; 2024 ByggPilot. Alla rättigheter förbehållna.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>Användarvillkor</Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>Integritetspolicy</Link>
          </nav>
        </footer>
      </div>

      {/* Modal Component */}
      {isModalOpen && <ProTipsModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

// --- Modal-komponent för Pro Tips ---

const ProTipsModal = ({ onClose }: { onClose: () => void }) => {
    // Tom platshållare, fylls i nästa steg
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Tips för proffs</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <IconX className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <p>Innehållet för modalen kommer här i nästa steg...</p>
                </div>
            </div>
        </div>
    );
};
