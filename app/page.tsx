import LoginButtons from "./components/auth/LoginButtons";
import { Navbar } from "./components";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background-primary">
      <Navbar />
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary">ByggPilot</h1>
        <p className="mt-2 mb-8 text-lg text-text-secondary">Din digitala kollega, redo att hjälpa.</p>
        <LoginButtons />
      </div>
    </main>
  );
}
