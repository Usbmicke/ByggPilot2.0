import React from 'react';

const GoogleIcon = () => (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.6-1.867 12.654-4.945l-6.464-4.851C28.205 35.145 26.225 36 24 36c-5.223 0-9.651-3.358-11.303-8H6.306C9.656 39.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.464 4.851C42.843 36.426 44 32.836 44 28c0-2.695-.362-5.31-.998-7.818l-.391.101z"></path>
    </svg>
);

const Header = () => (
  <header className="sticky top-0 z-50 bg-gray-900/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between border-b border-white/10">
        <div className="flex items-center">
          <img src="/images/byggpilotlogga1.png" alt="ByggPilot Logotyp" className="h-8 w-auto mr-3" />
          <span className="text-2xl font-bold text-white">ByggPilot</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100">
            <GoogleIcon />
            Logga in med Google
          </button>
          <button className="relative rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500">
            <span className="absolute -inset-1.5 animate-pulse rounded-lg bg-cyan-500/50 opacity-75 blur-lg"></span>
            <span className="relative">Testa ByggPilot Gratis</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
