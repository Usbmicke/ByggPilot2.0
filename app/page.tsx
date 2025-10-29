import LoginButtons from "./components/auth/LoginButtons";
import { Navbar } from "./components";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <Navbar />
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">ByggPilot</h1>
        <p className="mt-2 mb-8 text-lg text-gray-600">Din digitala kollega, redo att hjälpa.</p>
        <LoginButtons />
      </div>
    </main>
  );
}
