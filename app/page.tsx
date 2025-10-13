
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    } else if (status === 'unauthenticated') {
      router.replace('/landing');
    }
  }, [status, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
      Omdirigerar...
    </div>
  );
}
