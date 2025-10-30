
import Image from "next/image";
import LoginButtons from "./components/auth/LoginButtons";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background-primary">
      <div className="text-center px-4">
        <div className="mb-8">
          <Image 
            src="/images/byggpilotlogga1.png" 
            alt="ByggPilot Logotyp" 
            width={200} 
            height={53} 
            priority 
            style={{ margin: '0 auto', height: 'auto' }} // KORRIGERING: Bibehåll proportioner
          />
        </div>
        <h1 className="text-5xl font-bold text-text-primary">ByggPilot</h1>
        <p className="mt-2 mb-8 text-lg text-text-secondary">Din digitala kollega, redo att hjälpa.</p>
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-xs">
            <LoginButtons />
          </div>
        </div>
      </div>
    </main>
  );
}
