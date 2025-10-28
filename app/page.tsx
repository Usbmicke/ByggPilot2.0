 import { Hero, WhatWeDo, Oss, Navbar } from "./components";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Navbar />
      <Hero />
      <WhatWeDo />
      <Oss />
    </main>
  );
}