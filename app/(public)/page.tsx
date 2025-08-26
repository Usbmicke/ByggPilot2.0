'use client';
import { useAuth } from '../providers/AuthContext';
import React from 'react';
import { HardHat, DollarSign, Clock, FileText, BrainCircuit, Mail, FolderKanban, Calendar, CheckSquare, BarChart } from 'lucide-react';
import Image from 'next/image';

// Since we are building in a single file for now, components are defined here.
// In a real-world scenario, these would be in separate files under /components.

const Header = () => {
  const { login } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-gray-900 bg-opacity-80 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" width={32} height={32} />
          <span className="text-2xl font-bold text-white">ByggPilot</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={login}
            className="hidden md:block text-white font-semibold py-2 px-4 border border-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Logga in med Google
          </button>
          <button
            onClick={login}
            className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Testa ByggPilot Gratis
          </button>
        </div>
      </div>
    </header>
  );
};

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,36.625,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const HeroSection = () => {
  const { login } = useAuth();
  return (
    <section className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-68px)] bg-gray-900 text-white px-6">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Mindre papperskaos. <span className="text-cyan-400">Mer tid att bygga.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          ByggPilot är din nya digitala kollega som förvandlar administration till en automatiserad process, direkt i ditt befintliga Google-konto. Frigör tid, eliminera papperskaos och fokusera på det som verkligen driver din firma framåt.
        </p>
        <button
          onClick={login}
          className="flex items-center justify-center mx-auto bg-white text-gray-800 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-200 transition-colors duration-300"
        >
          <GoogleIcon className="mr-3" />
          Logga in med Google
        </button>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
  <div className="bg-gray-800/50 p-6 rounded-lg text-center h-full transition-shadow duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
    <div className="flex justify-center mb-4">
      <Icon className="text-cyan-400" size={40} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{children}</p>
  </div>
);

const ProblemCard = ({ icon: Icon, title, problem, solution }: { icon: React.ElementType, title: string, problem: string, solution: string }) => (
    <div className="bg-[#172A3A] p-6 rounded-lg text-center h-full transition-transform duration-300 hover:scale-105">
      <div className="flex justify-center mb-4">
        <Icon className="text-cyan-400" size={40} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-4">{problem}</p>
      <p className="text-cyan-400 font-semibold">{solution}</p>
    </div>
  );

const ProblemSection = () => (
    <section className="py-20 px-8 bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            Det administrativa kaoset som stjäl din lönsamhet
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProblemCard 
            icon={Clock} 
            title="Tidspressen dödar planeringen"
            problem="Timmar går åt till att jaga information istället för att leda projekt. Deadlines missas och kvaliteten blir lidande."
            solution="ByggPilot automatiserar flöden och samlar allt på ett ställe."
          />
          <ProblemCard 
            icon={FileText} 
            title="Spridd information, noll struktur"
            problem="Ritningar på ett ställe, ÄTA-lappar på ett annat, och kundens mail i en tredje. Inget är samlat."
            solution="En standardiserad mappstruktur skapas automatiskt för varje nytt projekt."
          />
          <ProblemCard 
            icon={BrainCircuit} 
            title="Beslut baserade på magkänsla"
            problem="Utan tydlig data och historik blir viktiga beslut gissningar, vilket riskerar både tidsplan och budget."
            solution="Få datadrivna insikter om dina mest lönsamma projekt."
          />
          <ProblemCard 
            icon={DollarSign} 
            title="Förlorade intäkter"
            problem="Missade ÄTA-arbeten, felaktiga ROT-avdrag och sena fakturor är direkta pengaförluster varje månad."
            solution="Håll koll på alla ÄTA-arbeten och få påminnelser om fakturering."
          />
        </div>
      </div>
    </section>
  );

const FeatureSection = () => (
  <section className="py-20 px-6 bg-gray-900">
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          Planeringen är A och O – men vem har tid?
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard icon={Mail} title="Från möte till offert – på minuter">
          Automatisera hela flödet från första kundkontakt i Gmail till färdigt projekt i Drive och kalenderbokning.
        </FeatureCard>
        <FeatureCard icon={CheckSquare} title="Trygghet & Kvalitetssäkring">
          Generera KMA-pärmar, egenkontroller och checklistor automatiskt baserat på projektets unika förutsättningar.
        </FeatureCard>
        <FeatureCard icon={FolderKanban} title="Sömlös Ekonomi">
          Skapa och hantera ÄTA-listor, få påminnelser om fakturering och håll koll på projektets ekonomi i realtid.
        </FeatureCard>
        <FeatureCard icon={BarChart} title="Lär av varje projekt">
          Få insikter om vilka projekt som är mest lönsamma och varför, så att du kan fatta smartare beslut framåt.
        </FeatureCard>
      </div>
    </div>
  </section>
);

const TrustSection = () => (
  <section className="py-20 px-6 bg-gray-800">
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          Byggd av en byggledare, för hantverkare
        </h2>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/3 flex-shrink-0">
          <Image 
            src="/images/mickebild.png" 
            alt="Michael Ekengren Fogelström, grundare av ByggPilot" 
            width={192} 
            height={192} 
            className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
          />
        </div>
        <div className="md:w-2/3 text-center md:text-left">
          <p className="text-xl italic text-gray-400 mb-6">
            "Jag har själv spenderat tusentals timmar med pappersarbete och vet exakt var skorna klämmer. Jag byggde ByggPilot för att ge oss hantverkare samma digitala fördelar som de stora drakarna har, utan att det kostar en förmögenhet eller kräver en IT-avdelning."
          </p>
          <p className="font-bold text-white text-lg">Michael Ekengren Fogelström, Grundare av ByggPilot</p>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800">
    <div className="container mx-auto py-6 px-6 text-center text-gray-500">
      <p>&copy; 2025 ByggPilot AB. Alla rättigheter förbehållna.</p>
    </div>
  </footer>
);


export default function LandingPage() {
  return (
    <div className="bg-gray-900 text-gray-300">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeatureSection />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}
