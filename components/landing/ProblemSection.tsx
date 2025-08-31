import React from 'react';

const Card = ({ icon, title, problem, solution }: { icon: React.ReactNode, title: string, problem: string, solution: string }) => (
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
                    {problems.map((p, i) => <Card key={i} {...p} />)}
                </div>
            </div>
        </section>
    );
};

// SVG Icons
const IconFileSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="11.5" cy="14.5" r="2.5"></circle><line x1="13.27" y1="16.27" x2="15" y2="18"></line></svg>;
const IconCalculator = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="8" y1="14" x2="8" y2="18"></line><line x1="8" y1="10" x2="16" y2="10"></line></svg>;
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a2.4 2.4 0 0 0-3.4 0L12 11.4l-2.3-2.3a2.4 2.4 0 0 0-3.4 0L3 12.2"></path></svg>;

export default ProblemSection;
