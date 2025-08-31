import React from 'react';

const FeatureCard = ({ title, description }: { title: string, description: string }) => (
  <div className="group relative rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-cyan-400/50">
     <div className="absolute -inset-px rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-100" style={{ boxShadow: '0 0 20px 5px rgba(34, 211, 238, 0.2)' }}></div>
     <div className="relative">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
    </div>
  </div>
);

const FeaturesSection = () => {
    const features = [
        {
            title: "Automatisk Projektstart",
            description: "Vidarebefordra ett kundmail. ByggPilot skapar en projektmapp, startar en kalkyl och bokar in uppföljning i din kalender."
        },
        {
            title: "Intelligent Kvittohantering",
            description: "Ta ett foto på ett kvitto. AI:n läser av innehållet, kopplar kostnaden till rätt projekt och arkiverar kvittot i Google Drive."
        },
        {
            title: "Sömlös ÄTA-hantering",
            description: "Spela in ett röstmemo om ett extraarbete. ByggPilot transkriberar, skapar ett ÄTA-underlag och förbereder för godkännande."
        },
        {
            title: "Kompletta Fakturaunderlag",
            description: "När projektet är klart sammanställer ByggPilot alla timmar, material och ÄTA till ett färdigt fakturaunderlag i Google Docs."
        }
    ];
    return (
        <section className="py-12 sm:py-20 bg-black/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Planeringen är A och O</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">ByggPilot är designad för att automatisera de viktigaste stegen i ditt arbetsflöde.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((f, i) => <FeatureCard key={i} {...f} />)}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
