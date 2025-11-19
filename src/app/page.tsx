
import Header from "@/app/_components/layout/Header"; 
import Hero from "@/app/_components/landing/Hero";
import ThreeCanvas from "@/app/_components/landing/ThreeCanvas";
import Footer from "@/app/_components/landing/Footer";
import CTASection from "@/app/_components/landing/CTASection";
import ProblemSection from "@/app/_components/landing/ProblemSection";
import SolutionSection from "@/app/_components/landing/SolutionSection";
import FounderSection from "@/app/_components/landing/FounderSection";


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
