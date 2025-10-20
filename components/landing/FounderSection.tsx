
import Image from 'next/image';

const FounderSection = () => (
    <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-gray-900/50 border border-gray-700/50 rounded-xl p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1 flex justify-center"><Image src="/images/micke.jpg" alt="Mikael, grundare av ByggPilot" width={160} height={160} className="w-40 h-40 rounded-full object-cover border-4 border-white/80 shadow-lg"/></div>
                <div className="md:col-span-2 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-3">Jag har känt din frustration</h2>
                    <blockquote className="text-gray-400 italic mb-4">"Jag har varit i branschen i 20 år – som snickare, arbetsledare och egenföretagare. Jag vet att administration kan växa till ett monster som stjäl både kvällar och vinst. Jag byggde ByggPilot för att krossa det monstret. Det här är verktyget jag själv önskar att jag hade haft. Det är byggt för att ge dig kontrollen tillbaka."</blockquote>
                    <p className="text-gray-200 font-semibold">- Michael Ekengren Fogelström, Grundare & Hantverkare</p>
                </div>
            </div>
        </div>
    </section>
);

export default FounderSection;
