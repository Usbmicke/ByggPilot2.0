
import { ProblemCard } from './ProblemCard';
import { IconStressClock, IconChaosFolder, IconDice, IconWalletMinus } from '@/components/icons/landing-icons'; // Vi antar att dessa flyttas till en gemensam fil

const problems = [
    {
        icon: <IconStressClock className="w-8 h-8"/>,
        title: "Tidspressen dödar vinsten",
        problem: "Kvällar och helger slukas av pappersarbete. Tid som borde gått till att planera nästa vinstdrivande projekt försvinner i administration.",
        solution: "Automatiserar flödet från offert till faktura. Frigör dina kvällar och ger dig tid att växa firman."
    },
    {
        icon: <IconChaosFolder className="w-8 h-8"/>,
        title: "Spridd information, noll överblick",
        problem: "Underlag, bilder och ÄTA-lappar ligger i olika telefoner, mejl och pärmar. Det är omöjligt att få en samlad bild av projektets status.",
        solution: "Skapar en central, digital projektmapp för varje jobb – automatiskt. Allt samlas på ett ställe, tillgängligt överallt."
    },
        {
        icon: <IconDice className="w-8 h-8"/>,
        title: "Gissningar istället för data",
        problem: "Utan solida underlag blir efterkalkyler rena gissningar. Du upprepar dyra misstag och prissätter nästa jobb baserat på magkänsla.",
        solution: "Ger dig efterkalkyler med ett klick. Prissätt jobb baserat på verklig data och se din marginal växa."
    },
    {
        icon: <IconWalletMinus className="w-8 h-8"/>,
        title: "Pengar som rinner iväg",
        problem: "Missade ÄTA-arbeten, felregistrerade timmar och bortglömt material är pengar som du jobbat för, men aldrig får betalt för.",
        solution: "Loggar allt – timmar, material, ÄTA – så att du garanterat får betalt för varje krona av ditt arbete."
    }
];

const ProblemSection = () => (
    <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Känner du igen dig i kaoset?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {problems.map(p => <ProblemCard key={p.title} {...p} />)}
            </div>
        </div>
    </section>
);

export default ProblemSection;
