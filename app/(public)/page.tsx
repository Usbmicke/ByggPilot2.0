'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/providers/AuthContext';
import Link from 'next/link';
import ProTipsModal from '@/app/components/ProTipsModal';

// --- IKONER --- 

const IconTrophy = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.87 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.13 18.75 17 20.24 17 22"/>
        <path d="M8 12h8"/>
        <path d="M8 9h8v4.66a4 4 0 0 1-1.17 2.83L12 19l-2.83-2.51A4 4 0 0 1 8 13.66V9z"/>
    </svg>
);

const GoogleIcon = (props) => (
    <svg {...props} viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);
const IconStressClock = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="m15.5 15.5-3 3-3-3"/><path d="m12.5 18.5-3-3 3-3"/>
    </svg>
);
const IconChaosFolder = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="m10 14-2 2 2 2"/><path d="m14 14 2 2-2 2"/>
    </svg>
);
const IconChartDown = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 18H6V6"/><path d="m22 22-7-7-4 4-3-3-4 4"/><path d="m15 22-3-3"/>
    </svg>
);
const IconWalletMinus = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 7V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M2 7h20"/><path d="M15 12h6"/>
    </svg>
);

// --- ÅTERANVÄNDBARA KOMPONENTER --- 

const cardBaseStyle = "bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all duration-300";
const cardHoverEffect = "hover:scale-105 hover:shadow-[0_0_25px_rgba(233,213,128,0.3)] hover:border-yellow-300/50";

const ProblemCard = ({ icon, title, problem, solution }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect}`}>
        <div className="text-cyan-400 mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400 mb-3 text-sm">{problem}</p>
        <p className="text-cyan-400 font-medium text-sm">{solution}</p>
    </div>
);

const FeatureCard = ({ title, description }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect} flex flex-col`}>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm flex-grow">{description}</p>
    </div>
);


// --- ANIMATION & BAKGRUND --- 

const CustomAnimationsStyle = () => (
  <style>{`
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 12px 0px rgba(56, 189, 248, 0.3); } 50% { box-shadow: 0 0 20px 3px rgba(56, 189, 248, 0.5); } }
    .animate-pulse-glow { animation: pulse-glow 4s infinite ease-in-out; }
    @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.7; } 100% { transform: translateY(-100vh); opacity: 0; } }
    .particle { position: absolute; border-radius: 50%; background: white; animation-name: float-up; animation-timing-function: linear; animation-iteration-count: infinite; }
  `}</style>
);

const AnimatedBackground = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 150 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5;
            const style = { 
                width: `${size}px`, 
                height: `${size}px`, 
                left: `${Math.random() * 100}%`, 
                animationDelay: `${Math.random() * 40}s`, 
                animationDuration: `${Math.random() * 20 + 20}s` 
            };
            return <div key={i} className="particle" style={style}></div>;
        });
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B2545]">
            {particles}
        </div>
    );
};


// --- HUVUDLAYOUT --- 
export default function LandingPage() {
  const { login } = useAuth();
  const [isProTipsModalOpen, setIsProTipsModalOpen] = useState(false);

  const handleLogin = (isDemo: boolean) => {
    login(isDemo);
  };

  return (
    <div className="text-gray-200 font-sans">
      <CustomAnimationsStyle />
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={36} height={36} />
              <span className="text-2xl font-bold text-white">ByggPilot</span>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => handleLogin(false)} className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold py-2 px-3 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-300">
                <GoogleIcon className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Logga in med Google</span>
                <span className="sm:hidden text-sm">Logga in</span>
              </button>
              <button onClick={() => handleLogin(true)} className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-cyan-600 transition-all duration-300 animate-pulse-glow">
                  <span className="hidden sm:inline">Testa ByggPilot Gratis</span>
                  <span className="sm:hidden">Testa Gratis</span>
              </button>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {/* --- HERO SECTION --- */}
          <section className="text-center py-24 md:py-32">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                  Mindre papperskaos.<br/>Mer tid att bygga.
              </h1>
              <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-8">
                  ByggPilot är din nya digitala kollega som förvandlar administration till en automatiserad process, direkt i ditt befintliga Google-konto. Frigör tid, eliminera papperskaos och fokusera på det som verkligen driver din firma framåt.
              </p>
              <button onClick={() => handleLogin(false)} className="inline-flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                  <GoogleIcon className="w-6 h-6" />
                  Logga in med Google
              </button>
              <p className="text-xs text-gray-500 mt-4">
                  ByggPilot är byggt för Googles kraftfulla och kostnadsfria verktyg. 
                  <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-1">
                      Skaffa ett konto här.
                  </a>
              </p>
            </div>
          </section>

          {/* --- PROBLEM SECTION --- */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Det administrativa kaoset som stjäl din lönsamhet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ProblemCard icon={<IconStressClock className="w-8 h-8"/>} title="Tidspressen dödar planeringen" problem="Kvällar och helger går åt till pappersarbete istället för att planera och riskbedöma nästa projekt – de aktiviteter som faktiskt driver vinsten." solution="Lösning: ByggPilot automatiserar flödet från offert till faktura, och ger dig tillbaka tiden du behöver för att planera och vinna lönsamma projekt."/>
                  <ProblemCard icon={<IconChaosFolder className="w-8 h-8"/>} title="Spridd information, noll struktur" problem="Underlag, foton och tidlappar ligger utspridda i olika mejl, telefoner och mappar. Detta informationskaos gör ordentlig planering och uppföljning omöjlig." solution="Lösning: Vid varje ny förfrågan skapar ByggPilot automatiskt en perfekt strukturerad projektmapp i din Google Drive där allt – mejl, bilder, dokument – samlas på ett och samma ställe."/>
                  <ProblemCard icon={<IconChartDown className="w-8 h-8"/>} title="Beslut baserade på magkänsla" problem="Efterkalkyler görs sällan eftersom underlaget är ofullständigt. Det leder till att man upprepar dyra misstag och prissätter nästa jobb på gissningar istället för data." solution="Lösning: Eftersom all data samlas korrekt blir efterkalkylen en enkel knapptryckning. Prissätt nästa jobb baserat på verklig data, inte gissningar."/>
                  <ProblemCard icon={<IconWalletMinus className="w-8 h-8"/>} title="Förlorade intäkter" problem="Missade ÄTA-arbeten, felregistrerade timmar och bortglömda materialkostnader är direkta pengar som försvinner på grund av bristande struktur." solution="Lösning: Med smart loggning av timmar, material och ÄTA-arbeten ser ByggPilot till att du får betalt för varenda krona av ditt arbete."/>
              </div>
            </div>
          </section>

                    {/* --- SOLUTION/WORKFLOW SECTION --- */}
                    <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Se hur din digitala kollega tar hand om administrationen.</h2>
                <div className="max-w-4xl mx-auto aspect-video bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden relative">
                    <Image src="/images/byggpilot.png" alt="Arbetsflödet i ByggPilot" fill style={{ objectFit: 'cover' }} />
                </div>
            </div>
          </section>

          {/* --- FEATURES SECTION --- */}
          <section className="py-16 md:py-24">
              <div className="container mx-auto px-6">
                  <div className="text-center max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planeringen är A och O – men vem har tid?</h2>
                      <p className="text-gray-400 mb-12">
                          I en bransch med pressade marginaler är noggrann planering din största konkurrensfördel. Men administrationen stjäl den tiden. ByggPilot är byggt för att bryta den onda cirkeln. Genom att automatisera det administrativa arbetet frigör vi din tid och expertis till det som faktiskt ökar lönsamheten.
                      </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <FeatureCard title="Från möte till offert – på minuter" description="Skapa och skicka professionella offerter direkt från kundmötet på din mobil eller surfplatta. Imponera på kunden och vinn fler jobb."/>
                      <FeatureCard title="Trygghet & Kvalitetssäkring" description="Få tillgång till färdiga, branschanpassade checklistor och riskanalyser för KMA och AFS. Gör rätt från början och ha alltid ryggen fri."/>
                      <FeatureCard title="Sömlös Ekonomi" description="Koppla ihop ByggPilot med Fortnox eller Visma. Allt du gör – från tidrapport till materialinköp – blir automatiskt ett färdigt bokföringsunderlag."/>
                      <FeatureCard title="Lär av varje projekt" description="Låt ByggPilot analysera dina avslutade projekt. Få datadrivna insikter som hjälper dig att effektivisera arbetet och prissätta framtida jobb mer lönsamt."/>
                  </div>
              </div>
          </section>

                    {/* --- PRO TIPS SECTION --- */}
                    <section className="py-16 md:py-24">
                        <div className="container mx-auto px-6">
                            <button 
                                onClick={() => setIsProTipsModalOpen(true)}
                                className="group max-w-4xl mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center w-full text-left hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
                            >
                                <div className="md:col-span-2 flex justify-center">
                                    <div className="bg-yellow-900/40 p-4 rounded-full border border-yellow-700 group-hover:scale-110 transition-transform duration-300">
                                        <IconTrophy className="w-12 h-12 text-yellow-300"/>
                                    </div>
                                </div>
                                <div className="md:col-span-10 text-center md:text-left">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Vässa ditt företag – Tips för proffs</h2>
                                    <p className="text-gray-400">
                                        Få tillgång till vår kunskapsbank med guider för att arbeta smartare, undvika vanliga fallgropar och bygga ett mer lönsamt byggföretag.
                                    </p>
                                    <span className="mt-4 inline-block text-yellow-400 font-semibold group-hover:underline">Öppna guiden &rarr;</span>
                                </div>
                            </button>
                        </div>
                    </section>

            {/* --- GRUNDAREN --- */}
            <section className="py-16 md:py-24">
              <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center">
    <div className="md:col-span-1 flex justify-center">
    <Image src="/images/micke.jpg" alt="Mikael, grundare av ByggPilot" width={160} height={160} className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"/>
    </div>
    <div className="md:col-span-2 text-center md:text-left">
    <h2 className="text-3xl font-bold text-white mb-3">Byggd av en hantverkare, för hantverkare.</h2>
    <blockquote className="text-gray-400 italic mb-4">
        "Jag har spenderat snart 20 år i branschen – från snickare och arbetsledare till egenföretagare. Jag vet att administration är avgörande för ett lyckat projekt, men jag har också sett hur den kan växa till ett pappersmonster som stjäl både kvällar och lönsamhet. Jag skapade ByggPilot för att lösa den frustrationen. Det är ett verktyg byggt med verklig insikt, för att ge dig tillbaka kontrollen och tiden att fokusera på det du gör bäst: att bygga."
    </blockquote>
    <p className="text-gray-300 font-semibold">- Michael Ekengren Fogelström, Grundare av ByggPilot</p>
    </div>
</div>
              </div>
            </section>

        </main>
        
        {/* --- FOOTER --- */}
        <footer className="border-t border-white/10 mt-16">
          <div className="container mx-auto px-6 py-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} ByggPilot AB | Integritetspolicy | Användarvillkor
          </div>
        </footer>
      </div>

      <ProTipsModal 
        isOpen={isProTipsModalOpen}
        onClose={() => setIsProTipsModalOpen(false)}
      />
    </div>
  );
}
