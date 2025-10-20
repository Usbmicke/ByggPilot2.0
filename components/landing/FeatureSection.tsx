
import { FeatureCard } from './FeatureCard';

const features = [
    {
        title: "Vinn jobbet på plats",
        description: "Skapa och skicka en proffsig offert direkt från mobilen under kundmötet. Medan konkurrenterna åker hem för att räkna, har du redan skickat."
    },
    {
        title: "KMA med total trygghet",
        description: "Använd branschanpassade checklistor och riskanalyser för KMA och AFS. Sov gott om nätterna med vetskapen att allt är dokumenterat korrekt."
    },
    {
        title: "Bokföring som sköter sig själv",
        description: "Koppla till Fortnox eller Visma (kommer snart). Se hur varje faktura och utlägg automatiskt blir ett perfekt bokföringsunderlag."
    },
    {
        title: "Lär av varje hammarslag",
        description: "Få datadrivna analyser av dina avslutade projekt. Identifiera dina mest lönsamma jobb och sluta upprepa dyra misstag."
    }
];

const FeatureSection = () => (
    <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Dina Nya Superkrafter</h2>
                <p className="text-gray-400 mb-12">ByggPilot är inte bara ett verktyg, det är en uppgradering. Här är vad du kan göra från dag ett.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map(f => <FeatureCard key={f.title} {...f} />)}
            </div>
        </div>
    </section>
);

export default FeatureSection;
