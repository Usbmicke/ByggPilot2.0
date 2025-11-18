
import Header from "@/components/layout/Header"; 
import Hero from "@/components/landing/Hero";
import ThreeCanvas from "@/components/landing/ThreeCanvas";
import Footer from "@/components/landing/Footer";
import CTASection from "@/components/landing/CTASection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FounderSection from "@/components/landing/FounderSection";


export default function LandingPage() {
  return (
    <div className="bg-neutral-950 min-h-screen text-white">
      <Header /> 
      <main className="relative">
        
        <ThreeCanvas /> 
        <Hero />
        <div className="relative z-10 bg-neutral-950">
            <SolutionSection />
            <ProblemSection />
            <FounderSection />
            <CTASection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
