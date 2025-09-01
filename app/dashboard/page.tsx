'use client';
import { useAuth } from '@/app/providers/AuthContext';

export default function DashboardPage() {
  const { user, accessToken, logout } = useAuth();

  const handleCreateStructure = async () => {
    await fetch('/api/google/create-drive-structure', { method: 'POST' });
    alert('Försöker skapa mappstruktur i Google Drive!');
  };

  const handleReadMail = async () => {
    if (!accessToken) {
      alert('Access token saknas!');
      return;
    }
    await fetch('/api/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    alert('Försöker läsa mail och skapa kalenderhändelse!');
  };

  return (
    <div>
      <h1>Välkommen, {user?.displayName}!</h1>
      <p>Här är din skyddade dashboard.</p>
      <button onClick={handleCreateStructure}>Skapa Mappstruktur</button>
      <button onClick={handleReadMail}>Läs Mail & Skapa Event</button>
      <button onClick={logout}>Logga ut</button>
    </div>
  );
}
