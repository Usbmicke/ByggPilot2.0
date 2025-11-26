'use client';

import { useAuth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // You can render a loading spinner here
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
            <p>Laddar...</p>
        </div>
    );
  }

  // This would be the place for the main app shell (e.g., with a sidebar)
  return (
    <div>
      {/* Future Sidebar, Header, etc. */}
      <main>{children}</main>
    </div>
  );
}
