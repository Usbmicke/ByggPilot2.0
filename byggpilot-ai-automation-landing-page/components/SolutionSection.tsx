import React from 'react';
import AnimatedSection from './AnimatedSection';

const FeatureCard: React.FC<{ title: string; wowText: string; value: string; featureNumber: string }> = ({ title, wowText, value, featureNumber }) => (
    <div className="group cursor-pointer relative p-8 overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-800/20 hover:border-sky-800/50">
        <div className="absolute top-8 right-8 text-5xl font-bold text-neutral-800/50 transition-colors group-hover:text-neutral-700">{featureNumber}</div>
        <div className="relative z-10">
            <h3 className="text-lg font-semibold text-sky-400 mb-2">{title}</h3>
            <p className="text-neutral-300 mb-4 font-semibold text-lg leading-relaxed">"{wowText}"</p>
            <div className="w-16 h-px bg-neutral-700 my-4"></div>
            <p className="text-neutral-400 text-sm"><span className="font-semibold text-neutral-200">Värde:</span> {value}</p>
        </div>
    </div>
);


const SolutionSection: React.FC = () => {
    return (
        <AnimatedSection>
            <div className="py-24 sm:py-32">
                <div className="container mx-auto px-6">
                    <div className="mx-auto max-w-2xl lg:max-w-4xl text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                           En digital expert som kan PBL, BBR, AFS och svenska brandstandarder.
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-neutral-400">
                            Vår AI är inte bara programmerad. Den är tränad på den samlade kunskapen från Boverket, Arbetsmiljöverket och Sveriges alla relevanta, öppna datakällor för byggbranschen. Den förstår kontext, ser risker och ger dig de svar du behöver – innan du ens hunnit formulera frågan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FeatureCard 
                            featureNumber="01"
                            title="BBR/PBL-Vakthunden som stoppar fel"
                            wowText="Skanna ett kvitto på 'Vanlig Gips 13mm' till ett badrumsprojekt. ByggPilot ser det, jämför med BBR i sin 'hjärna' och varnar dig omedelbart: 'STOPP: BBR §X.Y.Z kräver Våtrumsgips i zon 1. Detta är ett högrisk-moment.'"
                            value="Du stoppar ett 111-miljarders-problem innan det skruvats upp."
                        />
                        <FeatureCard 
                            featureNumber="02"
                            title="Den proaktiva projektledaren"
                            wowText="Starta ett 'Nytt Projekt'. ByggPilot är inte ett dött formulär. Den frågar: 'Jag ser att detta är ett ROT-projekt. Ska jag automatiskt skapa KMA-plan, riskanalys och den perfekta mappstrukturen i din Google Drive?'"
                            value="Från 0 till startklart projekt på 30 sekunder."
                        />
                        <FeatureCard 
                            featureNumber="03"
                            title="Den levande lönsamhetsanalysen"
                            wowText="Sluta gissa om du tjänar pengar. När du skannar kvitton och loggar timmar, analyserar ByggPilot datan mot din offert, i realtid. Du ser direkt: 'VARNING: 70% av materialbudgeten är använd, men bara 40% av jobbet är rapporterat.'"
                            value="Du går från att hoppas på vinst till att styra mot vinst."
                        />
                         <FeatureCard 
                            featureNumber="04"
                            title="Känslodetektorn för kundmail"
                            wowText="Ett nytt mail? ByggPilot läser det först, analyserar tonen och flaggar det: 'INFO: Kunden låter `irriterad` och `förvirrad` över fakturan.' AI:n hjälper dig sedan att skriva ett lugnt, pedagogiskt svar som bygger förtroende."
                            value="Du desarmerar konflikter innan de exploderar."
                        />
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default SolutionSection;