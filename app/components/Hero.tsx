 "use client";
import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="relative h-screen flex items-center justify-center">
      <Image
        src="/hero-bg.jpeg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="relative z-10 text-center text-white">
        <h1 className="text-5xl font-bold">Gör som oss, satsa på framtiden</h1>
      </div>
    </div>
  );
};

export default Hero;