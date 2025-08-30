
import React from 'react';
import { IconX, IconGavel, IconTrendingUp, IconMessageSquare, IconShieldAlert, IconFileText, IconBookOpen, IconClipboardCheck, IconScale, IconLightbulb } from '../constants';

interface ProTipsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TipCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
}

const TipCard: React.FC<TipCardProps> = ({ icon, title, children, className }) => (
    <div className={`bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 text-cyan-400">{icon}</div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <div className="text-gray-300 text-sm space-y-3 leading-relaxed">
            {children}
        </div>
    </div>
);


const ProTipsModal: React.FC<ProTipsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in-fast p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-6xl relative max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 md:p-8 border-b border-gray-700 flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 p-2 rounded-full hover:bg-gray-700/50">
                        <IconX className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <IconLightbulb className="w-10 h-10 text-yellow-300 flex-shrink-0" />
                        <div>
                             <h2 className="text-2xl md:text-3xl font-bold text-white">Vässa ditt företag – Tips för proffs</h2>
                             <p className="text-gray-400 mt-1 max-w-3xl">Välkommen till vår kunskapsbank. Här har vi samlat guider som hjälper dig att arbeta mer professionellt, undvika fallgropar och bygga starkare kundrelationer.</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <TipCard icon={<IconGavel className="w-6 h-6" />} title="Rätt avtal för rätt jobb – En snabbguide">
                            <p>Visste du att många i branschen blandar ihop entreprenadformer och upphandlingsformer? Att ha koll på detta visar på professionalism och säkerställer att du och din beställare har samsyn kring ansvaret.</p>
                            <div className="space-y-2 mt-3">
                                <p><strong className="text-white">Entreprenadformer (VEM ansvarar för VAD?)</strong></p>
                                <ul className="list-disc list-inside pl-2 space-y-1 text-gray-400">
                                    <li><strong>Utförandeentreprenad:</strong> Beställaren ger dig färdiga ritningar och beskrivningar. Ditt ansvar är att bygga enligt dem. Standardavtal: AB 04.</li>
                                    <li><strong>Totalentreprenad:</strong> Du som entreprenör ansvarar för BÅDE projektering och utförande. Standardavtal: ABT 06.</li>
                                </ul>
                                <p><strong className="text-white">Upphandlingsformer (HUR organiseras projektet?)</strong></p>
                                <ul className="list-disc list-inside pl-2 space-y-1 text-gray-400">
                                    <li><strong>Generalentreprenad:</strong> Beställaren skriver ETT kontrakt med dig.</li>
                                    <li><strong>Delad entreprenad:</strong> Beställaren skriver FLERA kontrakt med olika specialister.</li>
                                </ul>
                                 <p><strong className="text-white">För jobb mot privatpersoner (konsumenter):</strong></p>
                                 <ul className="list-disc list-inside pl-2 space-y-1 text-gray-400">
                                    <li><strong>Hantverkarformuläret 17:</strong> Perfekt för reparations- och ombyggnadsarbeten (ROT).</li>
                                    <li><strong>ABS 18:</strong> Används vid ny- eller tillbyggnad av småhus.</li>
                                </ul>
                            </div>
                            
                            <div className="mt-4 p-4 bg-cyan-900/30 border border-cyan-700/50 rounded-lg">
                                 <div className="flex items-center gap-3 mb-2">
                                    <IconTrendingUp className="w-5 h-5 text-cyan-300"/>
                                    <h4 className="text-md font-bold text-white">Framtidssäkra ditt företag: Nya regler 2025</h4>
                                </div>
                                <p className="text-cyan-200/90 text-xs">Stora förändringar är på väg i branschens viktigaste regelverk. Företag som förbereder sig nu kommer att ha ett stort försprång.</p>
                                <ul className="list-disc list-inside pl-2 mt-2 space-y-1 text-gray-400 text-xs">
                                    <li><strong>AB 25 ersätter AB 04/ABT 06:</strong> De nya standardavtalen, AB 25 och ABPU 25, håller på att färdigställas.</li>
                                    <li><strong>Fokus: Eliminera otydliga "ÄTA-jobb":</strong> Begreppet ÄTA ersätts med "ändring av entreprenaden" för att tvinga fram bättre och mer kompletta förfrågningsunderlag från start.</li>
                                    <li><strong>Nya PBL och BBR på gång:</strong> Även om nya regelverk träder i kraft, gäller det gamla avtalet (t.ex. ABT 06) för ett pågående projekt tills det är färdigställt.</li>
                                </ul>
                            </div>
                        </TipCard>

                        <TipCard icon={<IconMessageSquare className="w-6 h-6" />} title="Planering & Kommunikation – Din viktigaste investering">
                            <p>Den vanligaste orsaken till konflikter är en stressad och bristfällig planering. Ett gediget förarbete är inte en kostnad – det är en investering i ett smidigt projekt och en nöjd kund.</p>
                            <ul className="list-disc list-inside pl-2 mt-3 space-y-2 text-gray-400">
                                <li><strong>Ta betalt för förarbetet:</strong> Var inte rädd för att specificera och ta betalt för planeringsarbetet. Förklara för din beställare att varje timme ni lägger på en noggrann förstudie minskar risken för dyra missförstånd.</li>
                                <li><strong>Överträffa förväntningarna på kommunikation:</strong> Dålig återkoppling är hantverkares sämsta rykte. Bestäm från start hur och när ni ska kommunicera. Ett snabbt SMS om en försening bygger enormt förtroende.</li>
                            </ul>
                        </TipCard>

                        <TipCard icon={<IconShieldAlert className="w-6 h-6" />} title="Riskhantering – Tänk steget längre än konkurrenterna">
                            <p>Att visa en beställare att du har en plan för vad som kan gå fel är ett kraftfullt sätt att sticka ut. Det visar att du planerar för ett lyckat projekt, inte bara hoppas på det bästa.</p>
                             <ul className="list-disc list-inside pl-2 mt-3 space-y-2 text-gray-400">
                                <li><strong>Börja med en SWOT-analys:</strong> Identifiera snabbt projektets Styrkor, Svagheter, Möjligheter och Hot.</li>
                                <li><strong>Gör en enkel riskanalys:</strong> "Svagheter" och "Hot" från din SWOT blir underlaget. Bedöm sannolikhet och konsekvens.</li>
                                <li><strong>Använd en mall:</strong> Du behöver inte uppfinna hjulet. <a href="https://www.projektmallar.se/riskanalys/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Gratis mall för enkel riskhantering</a></li>
                            </ul>
                        </TipCard>
                        
                        <TipCard icon={<IconFileText className="w-6 h-6" />} title="Skriv ALLTID avtal – Skydda dig och din verksamhet">
                           <p>Muntliga avtal skapar osäkerhet. Som seriös hantverkare skyddar ett skriftligt avtal inte bara kunden, utan även dig och ditt företag. Det är ditt främsta verktyg för att undvika dyra tvister om vad som egentligen ingick i priset.</p>
                        </TipCard>

                        <TipCard icon={<IconBookOpen className="w-6 h-6" />} title="Bli expert på din hemmabana – Utbilda dig med Boverket!">
                            <p>Boverket är myndigheten för byggande och boende, och deras hemsida är en guldgruva med gratis information som kan ge dig ett försprång. Genom att lägga två timmar på en av Boverkets gratis e-utbildningar kan du stoltsera mot kunder att du är uppdaterad.</p>
                             <ul className="list-disc list-inside pl-2 mt-3 space-y-2 text-gray-400">
                                <li><strong>Kunskapsbanken:</strong> Här finns guider och checklistor som förklarar byggreglerna (BBR) på ett enkelt sätt. Använd den för att snabbt få svar på tekniska frågor.</li>
                                <li><a href="https://www.boverket.se/sv/PBL-kunskapsbanken/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Boverkets Kunskapsbank</a></li>
                                <li><a href="https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/plan-och-bygglag-2010900_sfs-2010-900/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Plan- och bygglagen (PBL)</a></li>
                            </ul>
                        </TipCard>
                        
                         <TipCard icon={<IconClipboardCheck className="w-6 h-6" />} title="Bygglov beviljat? Kom ihåg Startbesked!">
                           <p>Informera din kund om processen för att visa din expertis. Många kunder tror att de får börja bygga så fort bygglovet är beviljat.</p>
                           <p className="mt-2">Påminn kunden om att efter bygglov följer ett tekniskt samråd med kommunen, och först därefter får man ett startbesked – den officiella signalen att bygget får påbörjas. Detta enkla råd kan bespara din kund dyra sanktionsavgifter.</p>
                        </TipCard>

                         <TipCard icon={<IconScale className="w-6 h-6" />} title="Ritning vs. Beskrivning – Vad gäller vid en tvist?">
                           <p>Om ritningen och den tekniska beskrivningen säger olika saker finns en tydlig rangordning i standardavtalen (som AB 04). Förenklat gäller:</p>
                           <ol className="list-decimal list-inside pl-2 mt-2 space-y-1 font-semibold text-white">
                               <li>Kontraktet</li>
                               <li>Beskrivningar</li>
                               <li>Ritningar</li>
                           </ol>
                           <p className="mt-2">En textbeskrivning väger alltså tyngre än en ritning. Att känna till detta kan spara dig från kostsamma fel.</p>
                        </TipCard>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProTipsModal;