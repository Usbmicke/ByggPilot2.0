'use client';
import React from 'react';
import { Menu, Hourglass, Folders, TrendingDown, CircleDollarSign, Zap, ShieldCheck, Banknote, BrainCircuit, Lightbulb, ArrowRight } from 'lucide-react';

// --- Centralized Content Object ---
const content = {
  header: { /* ... */ },
  hero: { /* ... */ },
  problems: { /* ... */ },
  features: { /* ... */ },
  proTips: {
    icon: Lightbulb,
    headline: "Vässa ditt företag – Tips för proffs",
    description: "Få tillgång till vår kunskapsbank med guider för att arbeta smartare, undvika vanliga fallgropar och bygga ett mer lönsamt byggföretag.",
    link: "Öppna guiden",
  },
  // Sista sektionerna läggs till härnäst
};

// --- (Behåller tidigare SVG-komponenter och innehållsobjekt oförändrade) ---
const GoogleGLogo = (props) => (
  <svg {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48 24C48 22.0427 47.8438 20.125 47.5469 18.25H24V29.0938H37.4531C36.8594 32.2812 35.0312 34.9688 32.2969 36.8906V44.25H41.0625C45.5625 40.2188 48 32.7656 48 24Z" fill="#4285F4"/><path d="M24 48C30.4688 48 35.9531 45.9375 40.0312 42.6094L32.2969 35.8438C30.2344 37.2656 27.3281 38.25 24 38.25C17.4375 38.25 11.8594 33.9375 9.9375 28.3125H1.92188V35.6719C6.04687 43.5938 14.3437 48 24 48Z" fill="#34A853"/><path d="M9.9375 28.3125C9.46875 26.9375 9.23438 25.4688 9.23438 24C9.23438 22.5312 9.46875 21.0625 9.9375 19.6875V12.3281H1.92188C0.671875 14.8594 0 17.8125 0 21.0938C0 24.375 0.671875 27.3281 1.92188 29.8594L9.9375 28.3125Z" fill="#FBBC05"/><path d="M24 9.75C27.0469 9.75 29.6719 10.7812 31.8281 12.8906L39.1406 5.57812C35.0469 2.15625 29.9062 0 24 0C14.3438 0 6.04687 4.40625 1.92188 12.3281L9.9375 19.6875C11.8594 14.0625 17.4375 9.75 24 9.75Z" fill="#EA4335"/></svg>
);
const Logo = (props) => (
    <svg {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.0625 44L17.4375 39.0312H8.3125V8.125H17.4375L22.0625 4H39.6875V44H22.0625Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><path d="M26.5 14.75V19.625H35.25V14.75H26.5Z" fill="#06B6D4" /><path d="M26.5 24.5V29.25H35.25V24.5H26.5Z" fill="#06B6D4" /><path d="M8.3125 19.625H17.4375V29.25H8.3125V19.625Z" fill="#06B6D4" /></svg>
);


// --- Reusable Components ---
const GlassCard = ({ icon: Icon, title, children, className = '' }) => (
    <div className={`group relative rounded-2xl border border-gray-700 bg-gray-800/50 p-6 transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] ${className}`}>
        {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                <Icon className="h-8 w-8 text-cyan-400" strokeWidth={1.5} />
            </div>
        )}
        <h3 className={`mt-5 text-lg font-bold text-gray-100 ${Icon ? '' : 'mt-0'}`}>{title}</h3>
        <div className="mt-2 text-sm text-gray-400">{children}</div>
    </div>
);


// --- Page Section Components (Header, Hero, ProblemSolution, Features are unchanged) ---
const Header = () => ( <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur-sm"><div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6"><a href="#" className="flex items-center space-x-3"><Logo className="h-9 w-9" /><span className="text-2xl font-bold text-white">{content.header.logotype}</span></a><div className="flex items-center space-x-4"><a href="#" className="hidden h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:flex"><GoogleGLogo className="mr-2 h-5 w-5" /><span className="hidden lg:inline">{content.header.login}</span><span className="lg:hidden">{content.header.loginShort}</span></a><a href="#" className="relative inline-flex h-10 items-center justify-center rounded-md bg-cyan-500 px-5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-cyan-400"><span className="absolute -inset-1.5 animate-pulse-glow rounded-lg bg-cyan-500/50 opacity-75 blur-lg"></span><span className="relative"><span className="hidden md:inline">{content.header.signup}</span><span className="md:hidden">{content.header.signupShort}</span></span></a><button className="md:hidden rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white"><Menu className="h-6 w-6" /></button></div></div></header> );
const Hero = () => ( <section className="py-24 md:py-32"><div className="container mx-auto px-4 text-center"><h1 className="whitespace-pre-wrap text-4xl font-extrabold tracking-tight text-white md:text-6xl">{content.hero.headline}</h1><p className="mx-auto mt-6 max-w-3xl text-lg text-gray-400 md:text-xl">{content.hero.subheadline}</p><div className="mt-8 flex justify-center"><a href="#" className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-base font-semibold text-gray-800 shadow-lg transition-transform duration-200 ease-in-out hover:scale-105"><GoogleGLogo className="mr-3 h-6 w-6" />{content.hero.primaryAction}</a></div><p className="mt-4 text-xs text-gray-500">{content.hero.secondaryNotice}{' '}<a href="#" className="text-cyan-400 underline-offset-2 hover:underline">{content.hero.secondaryLink}</a></p></div></section> );
const ProblemSolution = () => ( <section className="py-24 sm:py-32"><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="sm:text-center"><h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{content.problems.headline}</h2></div><div className="mx-auto mt-20 max-w-lg space-y-8 sm:mt-16 lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-4 lg:gap-8 lg:space-y-0">{content.problems.cards.map((card) => ( <GlassCard key={card.title} icon={card.icon} title={card.title}><p>{card.problem}</p><p className="mt-4 font-medium text-cyan-400">Lösning: <span className="text-gray-300">{card.solution}</span></p></GlassCard> ))}</div></div></section> );
const Features = () => ( <section className="py-24 sm:py-32"><div className="mx-auto max-w-7xl px-6 lg:px-8"><div className="mx-auto max-w-2xl lg:text-center"><h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{content.features.headline}</h2><p className="mt-6 text-lg leading-8 text-gray-400">{content.features.subheadline}</p></div><div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"><div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">{content.features.cards.map(card => ( <GlassCard key={card.title} icon={card.icon} title={card.title}><p>{card.description}</p></GlassCard> ))}</div></div></div></section> );

const ProTips = () => (
    <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <a href="#" className="group relative block rounded-2xl border border-gray-700 bg-gray-800/50 p-8 transition-all duration-300 hover:scale-105 hover:border-cyan-500/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)]">
                <div className="flex items-start">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/20">
                        <Lightbulb className="h-12 w-12 text-cyan-400" strokeWidth={1} />
                    </div>
                    <div className="ml-8">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl">{content.proTips.headline}</h2>
                        <p className="mt-3 text-lg text-gray-400">{content.proTips.description}</p>
                        <p className="mt-6 inline-flex items-center font-semibold text-cyan-400">
                            {content.proTips.link}
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </p>
                    </div>
                </div>
            </a>
        </div>
    </section>
);

// --- Huvudkomponent för landningssidan ---
export default function LandingPage() {
  // For full content, replace with the full content object at the top
  content.header = { logotype: "ByggPilot", login: "Logga in med Google", loginShort: "Logga in", signup: "Testa ByggPilot Gratis", signupShort: "Testa Gratis" };
  content.hero = { headline: "Mindre papperskaos.\nMer tid att bygga.", subheadline: "ByggPilot är din nya digitala kollega som förvandlar administration till en automatiserad process, direkt i ditt befintliga Google-konto. Frigör tid, eliminera papperskaos och fokusera på det som verkligen driver din firma framåt.", primaryAction: "Logga in med Google", secondaryNotice: "ByggPilot är byggt för Googles kraftfulla och kostnadsfria verktyg.", secondaryLink: "Skaffa ett konto här." };
  content.problems = { headline: "Det administrativa kaoset som stjäl din lönsamhet", cards: [ { icon: Hourglass, title: "Tidspressen dödar planeringen", problem: "Kvällar och helger går åt till pappersarbete istället för att planera och riskbedöma nästa projekt.", solution: "ByggPilot automatiserar flödet från offert till faktura, och ger dig tillbaka tiden du behöver för att planera.", }, { icon: Folders, title: "Spridd information, noll struktur", problem: "Underlag, foton och tidlappar ligger utspridda i olika mejl, telefoner och mappar.", solution: "Vid varje ny förfrågan skapar ByggPilot automatiskt en perfekt strukturerad projektmapp i din Google Drive.", }, { icon: TrendingDown, title: "Beslut baserade på magkänsla", problem: "Efterkalkyler görs sällan eftersom underlaget är ofullständigt, vilket leder till att dyra misstag upprepas.", solution: "Eftersom all data samlas korrekt blir efterkalkylen en enkel knapptryckning. Prissätt baserat på data, inte gissningar.", }, { icon: CircleDollarSign, title: "Förlorade intäkter", problem: "Missade ÄTA-arbeten, felregistrerade timmar och bortglömda materialkostnader är direkta pengar som försvinner.", solution: "Med smart loggning av timmar, material och ÄTA ser ByggPilot till att du får betalt för varenda krona av ditt arbete.", }, ] };
  content.features = { headline: "Planeringen är A och O – men vem har tid?", subheadline: "I en bransch med pressade marginaler är noggrann planering din största konkurrensfördel. Men administrationen stjäl den tiden. ByggPilot är byggt för att bryta den onda cirkeln. Genom att automatisera det administrativa arbetet frigör vi din tid och expertis till det som faktiskt ökar lönsamheten.", cards: [ { icon: Zap, title: "Från möte till offert – på minuter", description: "Starta ett nytt projekt direkt från ett e-postmeddelande. ByggPilot skapar en projektmapp, strukturerar uppgifter och förbereder en offert baserad på dina mallar – allt med ett klick." }, { icon: ShieldCheck, title: "Trygghet & Kvalitetssäkring", description: "Genomför och dokumentera enkelt egenkontroller och riskanalyser direkt i systemet. Allt sparas automatiskt i rätt projektmapp, tillgängligt för både dig och din beställare." }, { icon: Banknote, title: "Sömlös Ekonomi", description: "Registrera ÄTA-arbeten, tid och material löpande. När projektet är klart, genereras ett komplett fakturaunderlag som är redo att skickas. Inga fler bortglömda kostnader." }, { icon: BrainCircuit, title: "Lär av varje projekt", description: "Eftersom all data – från offert till sista arbetad timme – samlas på ett ställe, blir dina efterkalkyler en guldgruva av insikter. Se exakt var du tjänar pengar och var du kan förbättra dig." }, ] };


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main>
        <Hero />
        <div className="bg-black/20">
          <ProblemSolution />
        </div>
        <Features />
        <div className="bg-black/20">
           <ProTips />
        </div>
      </main>
    </div>
  );
}
