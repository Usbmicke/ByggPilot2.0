 import React from "react";
import Image from "next/image";

const Oss = () => {
  return (
    <div
      id="oss"
      className="h-screen bg-white flex flex-col items-center justify-center p-10"
    >
      <h2 className="text-3xl font-bold mb-8">Om Grundaren</h2>
      <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
        <div className="w-full md:w-1/2 p-4 flex justify-center">
          <Image
            src="/images/micke.jpg"
            alt="Om Grundaren"
            width={500}
            height={300}
            className="rounded-lg"
          />
        </div>
        <div className="w-full md:w-1/2 p-4">
          <h3 className="text-2xl font-semibold mb-4">Micke, Grundare</h3>
          <p>
            Micke är en passionerad utvecklare med en vision om att förenkla och förbättra den digitala världen. Med en gedigen bakgrund inom systemutveckling och en stark drivkraft att skapa meningsfulla lösningar, grundade han Byggpilot för att hjälpa företag att navigera i det digitala landskapet och förverkliga sina idéer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Oss;