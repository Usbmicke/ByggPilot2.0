'use client';
import React, { useEffect, useRef } from 'react';

// --- IKONER ---
const GoogleIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.6-1.867 12.654-4.945l-6.464-4.851C28.205 35.145 26.225 36 24 36c-5.223 0-9.651-3.358-11.303-8H6.306C9.656 39.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.464 4.851C42.843 36.426 44 32.836 44 28c0-2.695-.362-5.31-.998-7.818l-.391.101z"></path></svg>
);
const IconFileSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="11.5" cy="14.5" r="2.5"></circle><line x1="13.27" y1="16.27" x2="15" y2="18"></line></svg>;
const IconCalculator = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="8" y1="14" x2="8" y2="18"></line><line x1="8" y1="10" x2="16" y2="10"></line></svg>;
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a2.4 2.4 0 0 0-3.4 0L12 11.4l-2.3-2.3a2.4 2.4 0 0 0-3.4 0L3 12.2"></path></svg>;

// --- KOMPONENTER ---

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const particleCount = 50;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedY = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.y -= this.speedY;
        if (this.y < 0) {
          this.y = canvas.height;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if(!ctx) return;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if(!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(document.body);
    
    resizeCanvas();
    init();
    animate();

    return () => observer.disconnect();

  }, []);

  return (
    <div className="fixed inset-0 -z-10 bg-gray-900">
       <canvas ref={canvasRef} className="h-full w-full"></canvas>
       <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>
    </div>
  );
};

const Header = () => (
  <header className="sticky top-0 z-50 bg-gray-900/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between border-b border-white/10">
        <div className="flex items-center">
          <img src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" className="h-8 w-auto mr-3" />
          <span className="text-2xl font-bold text-white">ByggPilot</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100">
            <GoogleIcon />
            Logga in
          </button>
          <button className="relative rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500">
            <span className="absolute -inset-1.5 animate-pulse rounded-lg bg-cyan-500/50 opacity-75 blur-lg"></span>
            <span className="relative">Testa Gratis</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

const HeroSection = () => (
  <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
      Mindre papperskaos.
      <br />
      Mer tid att bygga.
    </h1>
    <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-400">
      ByggPilot är din digitala kollega som automatiserar administrationen. Vi förvandlar ditt Google Workspace till ett intelligent kontor så du kan fokusera på det du gör bäst.
    </p>
    <div className="mt-10 flex flex-col items-center justify-center gap-6">
      <button className="flex items-center justify-center rounded-lg bg-white px-6 py-3 text-lg font-semibold text-gray-900 shadow-sm transition-transform duration-200 hover:scale-105">
        <GoogleIcon className="h-6 w-6 mr-3" />
        Logga in med Google
      </button>
      <p className="text-sm text-gray-500">
        ByggPilot är byggd för Googles kraftfulla och kostnadsfria verktyg.
      </p>
    </div>
  </section>
);

const ProblemCard = ({ icon, title, problem, solution }: { icon: React.ReactNode, title: string, problem: string, solution: string }) => (
  <div className="group relative rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-cyan-400/50">
    <div className="absolute -inset-px rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-100" style={{ boxShadow: '0 0 20px 5px rgba(34, 211, 238, 0.2)' }}></div>
    <div className="relative">
      <div className="mb-4 text-cyan-400">{icon}</div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{problem}</p>
      <p className="mt-3 text-sm font-semibold text-cyan-400">{solution}</p>
    </div>
  </div>
);

const ProblemSection = () => {
    const problems = [
        {
            icon: <IconFileSearch />,
            title: "Spridd Information",
            problem: "Ritningar i mailen, avtal i en mapp, kundinfo i en annan. Att hitta rätt information tar evigheter.",
            solution: "ByggPilot centraliserar allt. Ett mail blir ett projekt i Google Drive, med allt samlat på ett ställe."
        },
        {
            icon: <IconCalculator />,
            title: "Glömda Kostnader",
            problem: "Kvitton försvinner, extraarbeten (ÄTA) glöms bort och fakturerbara timmar missas i röran.",
            solution: "Fota ett kvitto eller spela in ett röstmemo. ByggPilot lägger till kostnaden i projektet direkt."
        },
        {
            icon: <IconClock />,
            title: "Administrativt Övertid",
            problem: "Kvällar och helger går åt till att skapa offerter, sammanställa fakturaunderlag och jaga papper.",
            solution: "Från offert till faktura. ByggPilot automatiserar hela flödet och gör grovjobbet åt dig."
        },
        {
            icon: <IconChart />,
            title: "Noll Koll på Lönsamhet",
            problem: "Utan realtidsdata är det omöjligt att veta vilka projekt som faktiskt är lönsamma förrän det är för sent.",
            solution: "ByggPilot ger dig en levande projektkalkyl som uppdateras automatiskt med varje timme och kvitto."
        }
    ];

    return (
        <section className="py-12 sm:py-20 bg-black/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Kaoset som stjäl din lönsamhet</h2>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {problems.map((p, i) => <ProblemCard key={i} {...p} />)}
                </div>
            </div>
        </section>
    );
};

const TestimonialSection = () => (
    <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm md:flex md:items-center md:gap-8">
                    <div className="md:w-1/3 flex justify-center">
                        <img 
                            className="h-32 w-32 rounded-full object-cover ring-4 ring-cyan-500/50"
                            src="/images/mickebild.png" 
                            alt="Grundare Michael Fogelström Ekengren"
                        />
                    </div>
                    <div className="mt-6 md:mt-0 md:w-2/3">
                        <h3 className="text-xl font-bold text-white">Byggd av en hantverkare, för hantverkare.</h3>
                        <blockquote className="mt-4 border-l-4 border-cyan-500 pl-4 italic text-gray-400">
                            <p>"Efter 15 år i branschen såg jag samma problem överallt: duktiga hantverkare som drunknade i pappersarbete. Jag skapade ByggPilot för att ge oss tillbaka det vi är bäst på – att bygga."</p>
                        </blockquote>
                        <p className="mt-4 font-semibold text-white">Michael Fogelström Ekengren, Grundare</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="border-t border-white/10 bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} ByggPilot AB. Alla rättigheter förbehållna.</p>
                <div className="mt-2">
                    <a href="#" className="hover:text-cyan-400">Integritetspolicy</a>
                    <span className="mx-2">&middot;</span>
                    <a href="#" className="hover:text-cyan-400">Användarvillkor</a>
                </div>
            </div>
        </div>
    </footer>
);

// --- HUVUDKOMPONENTEN (LANDNINGSSIDAN) ---

export default function LandingPage() {
  return (
    <div className="bg-gray-900 text-gray-200 font-sans antialiased relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <ProblemSection />
          <TestimonialSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
