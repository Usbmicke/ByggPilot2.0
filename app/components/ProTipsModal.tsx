'use client';

import React from 'react';

// --- IKONER (specifika för modalen) ---
const IconX = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const IconGavel = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"></path><path d="m15 5 6 6"></path><path d="m9 11 8 8"></path>
    </svg>
);
const IconTrendingUp = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);
const IconMessageSquare = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
const IconShieldAlert = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>
    </svg>
);
const IconFileText = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
const IconBookOpen = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);
const IconClipboardCheck = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path>
    </svg>
);
const IconScale = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16.5l4-4L14.5 8"></path><path d="M8 8.5l-4 4 5.5 4.5"></path><path d="M12 22V2"></path><path d="M5 12H2"></path><path d="M19 12h3"></path>
    </svg>
);
export const IconLightbulb = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.09 16.05a1 1 0 0 1-.9.55H9.81a1 1 0 0 1-.9-.55L6.23 8.32a.5.5 0 0 1 .5-.62h10.54a.5.5 0 0 1 .5.62l-2.68 7.73z"></path>
        <path d="M12 16.6v2.24m-3.5-3.83.9-1.56m7.2 1.56-.9-1.56m-3.7-6.2v-3.8M5.88 8.32h12.24"></path>
    </svg>
);

const TipCard = ({ icon, title, children, className }) => (
    <div className={`bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 text-yellow-400">{icon}</div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <div className="text-gray-300 text-sm space-y-3 leading-relaxed">
            {children}
        </div>
    </div>
);

const ProTipsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
        >
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.2s ease-out forwards;
                }
            `}</style>
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
                            
                            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                                 <div className="flex items-center gap-3 mb-2">
                                    <IconTrendingUp className="w-5 h-5 text-yellow-300"/>
                                    <h4 className="text-md font-bold text-white">Framtidssäkra ditt företag: Nya regler 2025</h4>
                                </div>
                                <p className="text-yellow-200/90 text-xs">Stora förändringar är på väg i branschens viktigaste regelverk. Företag som förbereder sig nu kommer att ha ett stort försprång.</p>
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
                                <li><strong>Använd en mall:</strong> Du behöver inte uppfinna hjulet. <a href="https://www.projektmallar.se/riskanalys/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Gratis mall för enkel riskhantering</a></li>
                            </ul>
                        </TipCard>
                        
                        <TipCard icon={<IconFileText className="w-6 h-6" />} title="Skriv ALLTID avtal – Skydda dig och din verksamhet">
                           <p>Muntliga avtal skapar osäkerhet. Som seriös hantverkare skyddar ett skriftligt avtal inte bara kunden, utan även dig och ditt företag. Det är ditt främsta verktyg för att undvika dyra tvister om vad som egentligen ingick i priset.</p>
                        </TipCard>

                        <TipCard icon={<IconBookOpen className="w-6 h-6" />} title="Bli expert på din hemmabana – Utbilda dig med Boverket!">
                            <p>Boverket är myndigheten för byggande och boende, och deras hemsida är en guldgruva med gratis information som kan ge dig ett försprång. Genom att lägga två timmar på en av Boverkets gratis e-utbildningar kan du stoltsera mot kunder att du är uppdaterad.</p>
                             <ul className="list-disc list-inside pl-2 mt-3 space-y-2 text-gray-400">
                                <li><strong>Kunskapsbanken:</strong> Här finns guider och checklistor som förklarar byggreglerna (BBR) på ett enkelt sätt. Använd den för att snabbt få svar på tekniska frågor.</li>
                                <li><a href="https://www.boverket.se/sv/PBL-kunskapsbanken/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Boverkets Kunskapsbank</a></li>
                                <li><a href="https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/plan-och-bygglag-2010900_sfs-2010-900/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Plan- och bygglagen (PBL)</a></li>
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