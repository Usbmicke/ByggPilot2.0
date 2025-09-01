'use client';
import { useAuth } from '@/app/providers/AuthContext';

export default function HomePage() {
  const { login } = useAuth();

  return (
    <div>
      <h1>Välkommen till ByggPilot</h1>
      <button onClick={login}>Logga in med Google</button>
    </div>
  );
}
