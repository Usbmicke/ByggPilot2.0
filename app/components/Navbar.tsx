 import React from "react";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white bg-opacity-80 p-4 flex justify-between items-center z-20">
      <div className="flex items-center">
        <Image src="/byggpilot-logo.png" alt="Logo" width={50} height={50} />
      </div>
      <div className="flex items-center space-x-4">
        <a href="#what-we-do" className="text-gray-800 hover:text-gray-600">
          Vad vi gör
        </a>
        <a href="#oss" className="text-gray-800 hover:text-gray-600">
          Om Oss
        </a>
      </div>
    </nav>
  );
};

export default Navbar;