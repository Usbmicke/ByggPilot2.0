import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ThreeCanvas from '@/components/landing/ThreeCanvas';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import FounderSection from '@/components/landing/FounderSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
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
    </div>
  );
}
