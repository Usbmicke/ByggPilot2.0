
import { LoginButton } from "@/features/auth/LoginButton";

// This is the main public landing page.
// Its primary purpose is to present the login option to the user.

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid-gray-800/[0.2] relative flex items-center justify-center bg-gray-900">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gray-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      <div className="relative z-10 flex flex-col items-center space-y-8">
        <header className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tighter">
            Välkommen till ByggPilot
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl">
            Din digitala kollega i byggbranschen. Automatisera administration, från offert till faktura, och fokusera på det du gör bäst.
          </p>
        </header>

        <main>
          <LoginButton />
        </main>

        <footer className="text-center text-gray-500">
            <p>Genom att logga in godkänner du våra <a href="/anvandarvillkor" className="underline hover:text-white">användarvillkor</a> och <a href="/integritetspolicy" className="underline hover:text-white">integritetspolicy</a>.</p>
        </footer>
      </div>
    </div>
  );
}
