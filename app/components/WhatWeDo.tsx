 import React from "react";
import Image from "next/image";

const WhatWeDo = () => {
  return (
    <div
      id="what-we-do"
      className="h-screen bg-gray-100 flex flex-col items-center justify-center p-10"
    >
      <h2 className="text-3xl font-bold mb-8">Vad vi gör</h2>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
        <div className="w-full md:w-1/2 p-4">
          <h3 className="text-2xl font-semibold mb-4">Konsultverksamhet</h3>
          <p>
            Vår konsultverksamhet fokuserar på att hjälpa företag med deras
            digitala transformation. Vi erbjuder expertis inom systemutveckling,
            molntjänster och projektledning.
          </p>
        </div>
        <div className="w-full md:w-1/2 p-4 flex justify-center">
          <Image
            src="/what-we-do.jpeg"
            alt="What We Do"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default WhatWeDo;