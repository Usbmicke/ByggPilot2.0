
import React from 'react';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth'; 
import { getServerSession } from 'next-auth/next';
import MainAppClientBoundary from './MainAppClientBoundary';

const MainAppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // Om ingen session finns, skicka tillbaka till startsidan. Detta är korrekt.
    return redirect('/'); 
  }

  // Hämta isNewUser från den pålitliga server-sessionen.
  const isNewUser = session.user.isNewUser ?? false;

  // Renderar klient-delen och skickar med isNewUser-flaggan.
  // Ingen omdirigering sker här på servern, vilket löser hydration-felet.
  return (
    <MainAppClientBoundary isNewUser={isNewUser}>
      {children}
    </MainAppClientBoundary>
  );
};

export default MainAppLayout;
