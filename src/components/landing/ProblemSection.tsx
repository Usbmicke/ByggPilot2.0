import React from 'react';
import AnimatedSection from './AnimatedSection';

const PainPoint: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="group flex flex-col items-center md:items-start text-center md:text-left transition-all duration-300 ease-in-out hover:-translate-y-2">
    <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 text-sky-400 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:border-sky-500/50 group-hover:bg-sky-900/30">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2 transition-colors group-hover:text-sky-400">{title}</h3>
    <p className="text-neutral-400">{text}</p>
  </div>
);

const ProblemSection: React.FC = () => {
  return (
    <AnimatedSection>
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl lg:max-w-4xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Du jonglerar 10 roller. Men du är anställd för en.
            </h2>
            <p className="mt-6 text-lg leading-8 text-neutral-400">
             Att driva byggföretag idag är att tvingas vara administratör, ekonom, KMA-ansvarig och projektledare – samtidigt som du ska bygga. Det är ett system designat för att misslyckas.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-12 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <PainPoint 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
              title="TIDEN SPRINGER"
              text="Projektet drar över tiden (igen). Du lägger upp till 17 timmar i veckan på admin istället för på bygget."
            />
            <PainPoint 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
              title="KOSTNADEN SKENAR"
              text="Materialpriser, felbeställningar och oväntade ÄTA:s urholkar marginalen. Du vet inte om du tjänar pengar förrän det är för sent."
            />
            <PainPoint 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
              title="KVALITETEN BRISTER"
              text="Stress och press leder till misstag. De där 111 miljarderna i årliga byggfel kommer någonstans ifrån."
            />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default ProblemSection;
