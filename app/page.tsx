
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import ProTipsModal from '@/app/components/ProTipsModal';

// --- ICONS (Behålls som de är) ---
const GoogleIcon = (props) => (
    <svg {...props} viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
);
const IconStressClock = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconChaosFolder = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
);
const IconWalletMinus = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M2 7h20"/><path d="M15 12h6"/></svg>
);
const IconDice = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M16 8h.01"></path><path d="M12 12h.01"></path><path d="M8 16h.01"></path><path d="M8 8h.01"></path><path d="M16 16h.01"></path></svg>
);
export const IconLightbulb = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05a1 1 0 0 1-.9.55H9.81a1 1 0 0 1-.9-.55L6.23 8.32a.5.5 0 0 1 .5-.62h10.54a.5.5 0 0 1 .5.62l-2.68 7.73z"></path><path d="M12 16.6v2.24m-3.5-3.83.9-1.56m7.2 1.56-.9-1.56m-3.7-6.2v-3.8M5.88 8.32h12.24"></path></svg>
);

// --- REUSABLE COMPONENTS ---
const cardBaseStyle = "bg-background-secondary/50 backdrop-blur-sm border border-border-primary rounded-xl p-6 transition-all duration-300";
const cardHoverEffect = "hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:border-text-secondary/50";

const SolutionStyle = ({ children }) => (
    <div className="mt-auto pt-4 border-t border-accent-blue/20">
        <p className="text-sm text-accent-blue">
            <span className="font-bold">ByggPilot löser detta:</span> <span className="italic">{children}</span>
        </p>
    </div>
);

const ProblemCard = ({ icon, title, problem, solution }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect} flex flex-col`}>
        <div className="text-accent-blue mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary mb-3 text-sm flex-grow">{problem}</p>
        <SolutionStyle>{solution}</SolutionStyle>
    </div>
);

const FeatureCard = ({ title, description }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect} flex flex-col`}><h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3><p className="text-text-secondary text-sm flex-grow">{description}</p></div>
);


// --- ANIMATION & BACKGROUND ---
const CustomAnimationsStyle = () => (
  <style>{`
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 12px 0px rgba(59,130,246, 0.3); } 50% { box-shadow: 0 0 20px 3px rgba(59,130,246, 0.5); } }
    .animate-pulse-glow { animation: pulse-glow 4s infinite ease-in-out; }
    @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { transform: translateY(-100vh); opacity: 0; } }
    .particle { position: absolute; bottom: 0; border-radius: 50%; background: rgba(224, 224, 224, 0.15); animation-name: float-up; animation-timing-function: linear; animation-iteration-count: infinite; }
  `}</style>
);

const AnimatedBackground = () => {
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        const newParticles = Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5;
            const style = { width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 15}s`, animationDuration: `${Math.random() * 20 + 20}s` };
            return <div key={i} className="particle" style={style}></div>;
        });
        setParticles(newParticles);
    }, []);
    return (
        <div className="fixed inset-0 -z-10 bg-background-primary">{particles}</div>
    );
};


// --- HUVUDLAYOUT ---
export default function LandingPage() {
  const [isProTipsModalOpen, setIsProTipsModalOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSignIn = async () => {
      setIsSigningIn(true);
      try {
        await signIn('google', { callbackUrl: '/dashboard' });
      } catch (error) {
          console.error("NextAuth signIn error: ", error);
          setIsSigningIn(false);
      }
  };
  
  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="fixed inset-0 bg-background-primary flex items-center justify-center">
            <div className="text-text-primary">Laddar...</div>
        </div>
    );
  }

  return (
    <div className="text-text-primary font-sans bg-background-primary">
      <CustomAnimationsStyle />
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-50 bg-background-secondary/80 backdrop-blur-sm border-b border-border-primary/40">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={36} height={36} />
              <span className="text-2xl font-bold text-text-primary">ByggPilot</span>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={handleSignIn} 
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center gap-2 bg-text-primary text-background-primary font-semibold py-2 px-3 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50"
                >
                    {isSigningIn ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-background-primary"></span>
                    ) : (
                        <GoogleIcon className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline text-sm">Logga in med Google</span>
                    <span className="sm:hidden text-sm">Logga in</span>
                </button>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {/* --- HERO SECTION --- */}
          <section className="text-center py-24 md:py-32">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight mb-4">Mindre papperskaos.<br/>Mer tid att bygga.</h1>
              <p className="max-w-3xl mx-auto text-lg md:text-xl text-text-secondary mb-8">ByggPilot är din nya digitala kollega som förvandlar administration till en automatiserad process. Frigör tid, eliminera papperskaos och fokusera på det som verkligen driver din firma framåt.</p>
                <button onClick={handleSignIn} disabled={isSigningIn} className="inline-flex items-center justify-center gap-3 bg-text-primary text-background-primary font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 disabled:opacity-50">
                    {isSigningIn ? (
                         <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-background-primary"></span>
                    ) : (
                        <GoogleIcon className="w-6 h-6" />
                    )}
                    {isSigningIn ? 'Verifierar...' : 'Logga in med Google'}
                </button>
              <p className="text-xs text-text-secondary mt-4">ByggPilot är byggt för Googles kraftfulla och kostnadsfria verktyg. <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline ml-1">Skaffa ett konto här.</a></p>
            </div>
          </section>

          {/* --- PROBLEM SECTION --- */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">Det administrativa kaoset som stjäl din lönsamhet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ProblemCard icon={<IconStressClock className="w-8 h-8"/>} title="Tidspressen dödar planeringen" problem="Kvällar och helger går åt till pappersarbete istället för att planera och riskbedöma nästa projekt – de aktiviteter som faktiskt driver vinsten." solution="Automatiserar hela flödet från offert till faktura, vilket frigör tid för planering och nya, lönsamma projekt."/>
                  <ProblemCard icon={<IconChaosFolder className="w-8 h-8"/>} title="Spridd information, noll struktur" problem="Underlag, foton och tidlappar ligger utspridda i olika mejl, telefoner och mappar. Detta informationskaos gör ordentlig planering och uppföljning omöjlig." solution="Skapar automatiskt en perfekt projektmapp för varje ny förfrågan, där alla mejl, bilder och dokument samlas på ett ställe."/>
                  <ProblemCard icon={<IconDice className="w-8 h-8"/>} title="Beslut baserade på magkänsla" problem="Efterkalkyler görs sällan eftersom underlaget är ofullständigt. Det leder till att man upprepar dyra misstag och prissätter nästa jobb på gissningar istället för data." solution="Samlar all data korrekt så att efterkalkyler blir en enkel knapptryckning. Prissätt jobb baserat på verklig data, inte magkänsla."/>
                  <ProblemCard icon={<IconWalletMinus className="w-8 h-8"/>} title="Förlorade intäkter" problem="Missade ÄTA-arbeten, felregistrerade timmar och bortglömda materialkostnader är direkta pengar som försvinner på grund av bristande struktur." solution="Loggar automatiskt timmar, material och ÄTA-arbeten så att du garanterat får betalt för varje krona av ditt arbete."/>
              </div>
            </div>
          </section>
          
          {/* --- VIDEO SECTION --- */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">Se hur din digitala kollega tar hand om administrationen.</h2>
                <div className="max-w-4xl mx-auto aspect-video bg-background-secondary border border-border-primary rounded-lg flex items-center justify-center text-text-secondary overflow-hidden relative">
                    <p className="text-2xl font-semibold">Kommer snart...</p>
                </div>
            </div>
          </section>

          {/* --- FEATURES SECTION --- */}
          <section className="py-16 md:py-24">
              <div className="container mx-auto px-6">
                  <div className="text-center max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Planeringen är A och O – men vem har tid?</h2>
                      <p className="text-text-secondary mb-12">I en bransch med pressade marginaler är noggrann planering din största konkurrensfördel. Men administrationen stjäl den tiden. ByggPilot är byggt för att bryta den onda cirkeln.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <FeatureCard title="Från möte till offert – på minuter" description="Skapa och skicka professionella offerter direkt från kundmötet på din mobil eller surfplatta. Imponera på kunden och vinn fler jobb."/>
                      <FeatureCard title="Trygghet & Kvalitetssäkring" description="Få tillgång till färdiga, branschanpassade checklistor och riskanalyser för KMA och AFS. Gör rätt från början och ha alltid ryggen fri."/>
                      <FeatureCard title="Sömlös Ekonomi" description="Koppla ihop ByggPilot med Fortnox eller Visma. Allt du gör blir automatiskt ett färdigt bokföringsunderlag."/>
                      <FeatureCard title="Lär av varje projekt" description="Låt ByggPilot analysera dina avslutade projekt. Få datadrivna insikter som hjälper dig att effektivisera och prissätta framtida jobb mer lönsamt."/>
                  </div>
              </div>
          </section>

          {/* --- PRO TIPS SECTION --- */}
          <section className="py-16 md:py-24">
              <div className="container mx-auto px-6">
                  <button 
                      onClick={() => setIsProTipsModalOpen(true)}
                      className="group max-w-4xl mx-auto bg-background-secondary/50 border border-border-primary rounded-xl p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center w-full text-left hover:border-status-gold/50 hover:shadow-lg hover:shadow-status-gold/10 transition-all duration-300"
                  >
                      <div className="md:col-span-2 flex justify-center"><div className="bg-status-gold/20 p-4 rounded-full border border-status-gold/60 group-hover:scale-110 transition-transform duration-300"><IconLightbulb className="w-12 h-12 text-status-gold"/></div></div>
                      <div className="md:col-span-10 text-center md:text-left">
                          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Vässa ditt företag – Tips för proffs</h2>
                          <p className="text-text-secondary">Få tillgång till vår kunskapsbank med guider för att arbeta smartare, undvika vanliga fallgropar och bygga ett mer lönsamt byggföretag.</p>
                          <span className="mt-4 inline-block text-status-gold font-semibold group-hover:underline">Öppna guiden &rarr;</span>
                      </div>
                  </button>
              </div>
          </section>

          {/* --- FOUNDER SECTION --- */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto bg-background-secondary/50 border border-border-primary rounded-xl p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-1 flex justify-center"><Image src="/images/micke.jpg" alt="Mikael, grundare av ByggPilot" width={160} height={160} className="w-40 h-40 rounded-full object-cover border-4 border-text-primary shadow-lg"/></div>
                  <div className="md:col-span-2 text-center md:text-left">
                      <h2 className="text-3xl font-bold text-text-primary mb-3">Byggd av en hantverkare, för hantverkare.</h2>
                      <blockquote className="text-text-secondary italic mb-4">"Jag har spenderat snart 20 år i branschen – från snickare och arbetsledare till egenföretagare. Jag vet att administration är avgörande för ett lyckat projekt, men jag har också sett hur den kan växa till ett pappersmonster som stjäl både kvällar och lönsamhet. Jag skapade ByggPilot för att lösa den frustrationen. Det är ett verktyg byggt med verklig insikt, för att ge dig tillbaka kontrollen och tiden att fokusera på det du gör bäst: att bygga."</blockquote>
                      <p className="text-text-primary font-semibold">- Michael Ekengren Fogelström, Grundare av ByggPilot</p>
                  </div>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="border-t border-border-primary/40 mt-16">
          <div className="container mx-auto px-6 py-6 text-center text-text-secondary text-sm">© {new Date().getFullYear()} ByggPilot AB | Integritetspolicy | Användarvillkor</div>
        </footer>
      </div>

      <ProTipsModal isOpen={isProTipsModalOpen} onClose={() => setIsProTipsModalOpen(false)} />
    </div>
  );
}
