import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ThreeCanvas from './components/ThreeCanvas';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import FounderSection from './components/FounderSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import AudioControl from './components/AudioControl';

const App: React.FC = () => {
  return (
    <div className="bg-neutral-950">
      <div className="fixed top-0 left-0 w-full h-full -z-0">
        <ThreeCanvas />
      </div>
       <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-10" 
        style={{ background: 'radial-gradient(circle at center, rgba(10, 10, 10, 0) 40%, rgba(10, 10, 10, 1) 90%)' }}
      ></div>
      
      <div className="relative z-20">
        <Header />
        <main>
          <Hero />
          <ProblemSection />
          <SolutionSection />
          <FounderSection />
          <CTASection />
        </main>
        <Footer />
      </div>

      <AudioControl />
    </div>
  );
};

export default App;