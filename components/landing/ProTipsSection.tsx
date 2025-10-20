
'use client';

import { IconLightbulb } from "@/components/icons/landing-icons";

const ProTipsSection = ({ onOpenKnowledgeBase }) => (
    <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
            <button 
                onClick={onOpenKnowledgeBase}
                className="group max-w-4xl mx-auto bg-gray-900/50 border border-gray-700/50 rounded-xl p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center w-full text-left hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
                <div className="md:col-span-2 flex justify-center"><div className="bg-yellow-400/10 p-4 rounded-full border border-yellow-400/30 group-hover:scale-110 transition-transform duration-300"><IconLightbulb className="w-12 h-12 text-yellow-400"/></div></div>
                <div className="md:col-span-10 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Vässa ditt företag – Tips för proffs</h2>
                    <p className="text-gray-400">Få tillgång till vår kunskapsbank med guider för att arbeta smartare, undvika vanliga fallgropar och bygga ett mer lönsamt byggföretag.</p>
                    <span className="mt-4 inline-block text-yellow-400 font-semibold group-hover:underline">Öppna kunskapsbanken &rarr;</span>
                </div>
            </button>
        </div>
    </section>
);

export default ProTipsSection;
