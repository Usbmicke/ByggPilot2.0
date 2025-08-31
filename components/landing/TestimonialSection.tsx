import React from 'react';

const TestimonialSection = () => (
    <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm md:flex md:items-center md:gap-8">
                    <div className="md:w-1/3 flex justify-center">
                        <img 
                            className="h-32 w-32 rounded-full object-cover ring-4 ring-cyan-500/50"
                            src="/images/mickebild.png" 
                            alt="Grundare Michael Fogelström Ekengren"
                        />
                    </div>
                    <div className="mt-6 md:mt-0 md:w-2/3">
                        <h3 className="text-xl font-bold text-white">Byggd av en hantverkare, för hantverkare.</h3>
                        <blockquote className="mt-4 border-l-4 border-cyan-500 pl-4 italic text-gray-400">
                            <p>"Efter 15 år i branschen såg jag samma problem överallt: duktiga hantverkare som drunknade i pappersarbete. Jag skapade ByggPilot för att ge oss tillbaka det vi är bäst på – att bygga."</p>
                        </blockquote>
                        <p className="mt-4 font-semibold text-white">Michael Fogelström Ekengren, Grundare</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default TestimonialSection;
