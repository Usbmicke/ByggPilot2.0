'use client';

import React from 'react';
import AnimatedSection from './AnimatedSection';
import Image from 'next/image'; // Importerad

const FounderSection: React.FC = () => {
    return (
        <AnimatedSection>
            <div className="py-24 sm:py-32">
                <div className="container mx-auto px-6">
                    <div className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-12 lg:p-16 transition-all duration-300 ease-in-out hover:border-neutral-700/80 hover:shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center">
                            <div className="lg:col-span-1 flex justify-center">
                                {/* Ersatt platshållare med grundarens bild */}
                                <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center transition-all duration-300 ease-in-out group-hover:border-sky-400/50 group-hover:scale-105">
                                    <Image 
                                        src="/images/micke.jpg" 
                                        alt="Michael, grundare av ByggPilot" 
                                        width={256} 
                                        height={256} 
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-2 text-center lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Byggd av en byggare. Inte en byråkrat.
                                </h2>
                                <blockquote className="mt-6 text-lg leading-8 text-neutral-300 border-l-4 border-sky-400 pl-6 italic">
                                    "Jag har stått på bygget i 20 år. Jag har varit snickaren, arbetsledaren och egenföretagaren som drunknat i papper. Jag har sett hur admin-kaos och usel planering krossar marginaler och stjäl kvällar från familjen. Systemet vi jobbar i är byggt för att vi ska misslyckas. Jag byggde ByggPilot för att ge oss kontrollen tillbaka. För att vi ska kunna fokusera på det vi faktiskt älskar: att bygga."
                                </blockquote>
                                <p className="mt-8 font-semibold text-white">
                                    – Michael, Grundare & Byggare
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default FounderSection;
