
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import ProTipsModal from '@/app/components/ProTipsModal';
import GoogleIcon from '@/app/components/icons/GoogleIcon';

// --- IKONER & TEKNISKA KOMPONENTER ---
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
const cardBaseStyle = "bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-300";
const cardHoverEffect = "hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.2)] hover:border-blue-500/60";
const SolutionStyle = ({ children }) => (
    <div className="mt-auto pt-4 border-t border-blue-500/20">
        <p className="text-sm text-blue-400">
            <span className="font-bold">ByggPilots Lösning:</span> <span className="italic">{children}</span>
        </p>
    </div>
);
const ProblemCard = ({ icon, title, problem, solution }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect} flex flex-col`}>
        <div className="text-blue-400 mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400 mb-3 text-sm flex-grow">{problem}</p>
        <SolutionStyle>{solution}</SolutionStyle>
    </div>
);
const FeatureCard = ({ title, description }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect} flex flex-col`}><h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3><p className="text-gray-400 text-sm flex-grow">{description}</p></div>
);
const CustomAnimationsStyle = () => (
  <style>{`
    @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { transform: translateY(-100vh); opacity: 0; } }
    .particle { position: absolute; bottom: 0; border-radius: 50%; background: rgba(224, 224, 224, 0.1); animation-name: float-up; animation-timing-function: linear; animation-iteration-count: infinite; }
  `}</style>
);
const AnimatedBackground = () => {
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        const newParticles = Array.from({ length: 40 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5;
            const style = { width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 15}s`, animationDuration: `${Math.random() * 20 + 20}s` };
            return <div key={i} className="particle" style={style}></div>;
        });
        setParticles(newParticles);
    }, []);
    return (
        <div className="fixed inset-0 -z-10 bg-gray-900">{particles}</div>
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
      signIn('google', { callbackUrl: '/dashboard' }).catch(error => {
        console.error("NextAuth signIn error: ", error);
        setIsSigningIn(false);
      });
  };
  
  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-gray-300 animate-pulse">Ansluter...</div>
        </div>
    );
  }

  return (
    <div className="text-gray-200 font-sans bg-gray-900">
      <CustomAnimationsStyle />
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        {/* --- HEADER (MED KORREKT GOOGLE-KNAPP) --- */}
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/60">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={36} height={36} />
              <span className="text-2xl font-bold text-white">ByggPilot</span>
            </div>
            <nav>
                <button 
                  onClick={handleSignIn} 
                  disabled={isSigningIn}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 disabled:opacity-60"
                >
                    {isSigningIn ? 
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></span> : 
                        <GoogleIcon />
                    }
                    <span className='ml-3'>
                      {isSigningIn ? 'Ansluter...' : 'Logga in med Google'}
                    </span>
                </button>
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          {/* --- HERO SECTION (UTAN KNAPP) --- */}
          <section className="text-center py-24 md:py-32">
            <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">Från Övertid till Översikt.<br/>Omedelbart.</h1>
              <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-8">ByggPilot är din proaktiva, digitala arbetsledare. Vi tar inte bort administrationen – vi gör den osynlig. Få total kontroll över dina projekt, din tid och din lönsamhet.</p>
              
              <p className="text-xs text-gray-500 mt-4">Använder ditt befintliga Google-konto. Säkert, snabbt och enkelt. <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">Inget konto? Skaffa ett här.</a></p>
            </div>
          </section>

          {/* --- PROBLEM SECTION --- */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Känner du igen dig i kaoset?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <ProblemCard icon={<IconStressClock className="w-8 h-8"/>} title="Tidspressen dödar vinsten" problem="Kvällar och helger slukas av pappersarbete. Tid som borde gått till att planera nästa vinstdrivande projekt försvinner i administration." solution="Automatiserar flödet från offert till faktura. Frigör dina kvällar och ger dig tid att växa firman."/>
                  <ProblemCard icon={<IconChaosFolder className="w-8 h-8"/>} title="Spridd information, noll överblick" problem="Underlag, bilder och ÄTA-lappar ligger i olika telefoner, mejl och pärmar. Det är omöjligt att få en samlad bild av projektets status." solution="Skapar en central, digital projektmapp för varje jobb – automatiskt. Allt samlas på ett ställe, tillgängligt överallt."/>
                  <ProblemCard icon={<IconDice className="w-8 h-8"/>} title="Gissningar istället för data" problem="Utan solida underlag blir efterkalkyler rena gissningar. Du upprepar dyra misstag och prissätter nästa jobb baserat på magkänsla." solution="Ger dig efterkalkyler med ett klick. Prissätt jobb baserat på verklig data och se din marginal växa."/>
                  <ProblemCard icon={<IconWalletMinus className="w-8 h-8"/>} title="Pengar som rinner iväg" problem="Missade ÄTA-arbeten, felregistrerade timmar och bortglömt material är pengar som du jobbat för, men aldrig får betalt för.
                  " solution="Loggar allt – timmar, material, ÄTA – så att du garanterat får betalt för varje krona av ditt arbete."/>
              </div>
            </div>
          </section>
          
          {/* --- VIDEO SECTION --- */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Se din digitala kollega i action.</h2>
                <div className="max-w-4xl mx-auto aspect-video bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-2xl">
                    <video src="/images/ByggPilot-ritningen.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
                </div>
            </div>
          </section>

          {/* --- FEATURES SECTION --- */}
          <section className="py-16 md:py-24">
              <div className="container mx-auto px-6">
                  <div className="text-center max-w-3xl mx-auto">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Dina Nya Superkrafter</h2>
                      <p className="text-gray-400 mb-12">ByggPilot är inte bara ett verktyg, det är en uppgradering. Här är vad du kan göra från dag ett.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <FeatureCard title="Vinn jobbet på plats" description="Skapa och skicka en proffsig offert direkt från mobilen under kundmötet. Medan konkurrenterna åker hem för att räkna, har du redan skickat."/>
                      <FeatureCard title="KMA med total trygghet" description="Använd branschanpassade checklistor och riskanalyser för KMA och AFS. Sov gott om nätterna med vetskapen att allt är dokumenterat korrekt."/>
                      <FeatureCard title="Bokföring som sköter sig själv" description="Koppla till Fortnox eller Visma (kommer snart). Se hur varje faktura och utlägg automatiskt blir ett perfekt bokföringsunderlag."/>
                      <FeatureCard title="Lär av varje hammarslag" description="Få datadrivna analyser av dina avslutade projekt. Identifiera dina mest lönsamma jobb och sluta upprepa dyra misstag."/>
                  </div>
              </div>
          </section>

          {/* --- PRO TIPS SECTION --- */}
          <section className="py-16 md:py-24">
              <div className="container mx-auto px-6">
                  <button 
                      onClick={() => setIsProTipsModalOpen(true)}
                      className="group max-w-4xl mx-auto bg-gray-900/50 border border-gray-700/50 rounded-xl p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center w-full text-left hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
                  >
                      <div className="md:col-span-2 flex justify-center"><div className="bg-yellow-400/10 p-4 rounded-full border border-yellow-400/30 group-hover:scale-110 transition-transform duration-300"><IconLightbulb className="w-12 h-12 text-yellow-400"/></div></div>
                      <div className="md:col-span-10 text-center md:text-left">
                          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Vässa ditt företag – Tips för proffs</h2>
                          <p className="text-gray-400">Få tillgång till vår kunskapsbank med guider för att arbeta smartare, undvika vanliga fallgropar och bygga ett mer lönsamt byggföretag.</p>
                          <span className="mt-4 inline-block text-yellow-400 font-semibold group-hover:underline">Öppna kunskapsbanken &rarr;</span>
                      </div>
                  </button>
              </div>
          </section>

          {/* --- GRUNDARE-SEKTION --- */}
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto bg-gray-900/50 border border-gray-700/50 rounded-xl p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-1 flex justify-center"><Image src="/images/micke.jpg" alt="Mikael, grundare av ByggPilot" width={160} height={160} className="w-40 h-40 rounded-full object-cover border-4 border-white/80 shadow-lg"/></div>
                  <div className="md:col-span-2 text-center md:text-left">
                      <h2 className="text-3xl font-bold text-white mb-3">Jag har känt din frustration</h2>
                      <blockquote className="text-gray-400 italic mb-4">"Jag har varit i branschen i 20 år – som snickare, arbetsledare och egenföretagare. Jag vet att administration kan växa till ett monster som stjäl både kvällar och vinst. Jag byggde ByggPilot för att krossa det monstret. Det här är verktyget jag själv önskar att jag hade haft. Det är byggt för att ge dig kontrollen tillbaka."</blockquote>
                      <p className="text-gray-200 font-semibold">- Michael Ekengren Fogelström, Grundare & Hantverkare</p>
                  </div>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="border-t border-gray-700/60 mt-16">
          <div className="container mx-auto px-6 py-6 text-center text-gray-500 text-sm">© {new Date().getFullYear()} ByggPilot AB | <a href="/integritetspolicy" className="hover:underline">Integritetspolicy</a> | <a href="/anvandarvillkor" className="hover:underline">Användarvillkor</a></div>
        </footer>
      </div>

      <ProTipsModal isOpen={isProTipsModalOpen} onClose={() => setIsProTipsModalOpen(false)} />
    </div>
  );
}
