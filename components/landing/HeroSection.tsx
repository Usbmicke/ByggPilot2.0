import React from 'react';

const GoogleIcon = () => (
    <svg className="mr-3 h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.6-1.867 12.654-4.945l-6.464-4.851C28.205 35.145 26.225 36 24 36c-5.223 0-9.651-3.358-11.303-8H6.306C9.656 39.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.464 4.851C42.843 36.426 44 32.836 44 28c0-2.695-.362-5.31-.998-7.818l-.391.101z"></path>
    </svg>
);


const HeroSection = () => (
  <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
      Mindre papperskaos.
      <br />
      Mer tid att bygga.
    </h1>
    <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-400">
      ByggPilot är din digitala kollega som automatiserar administrationen. Vi förvandlar ditt Google Workspace till ett intelligent kontor så du kan fokusera på det du gör bäst.
    </p>
    <div className="mt-10 flex flex-col items-center justify-center gap-6">
      <button className="flex items-center justify-center rounded-lg bg-white px-6 py-3 text-lg font-semibold text-gray-900 shadow-sm transition-transform duration-200 hover:scale-105">
        <GoogleIcon />
        Logga in med Google
      </button>
      <p className="text-sm text-gray-500">
        Kräver ett Google-konto för att fungera. 
        <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300"> Läs mer om varför.</a>
      </p>
    </div>
  </section>
);

export default HeroSection;
