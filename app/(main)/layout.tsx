
import React from 'react';
import { redirect } from 'next/navigation';
import { authOptions } from '@/api/auth/[...nextauth]/route'; 
import { getServerSession } from 'next-auth/next';
import MainAppClientBoundary from './MainAppClientBoundary';

// Denna layout är nu mycket renare. Dess enda ansvar är att hämta den
// pålitliga sessionen och skicka ner isNewUser-flaggan.

const MainAppLayout = async ({ children }: { children: React.ReactNode }) => {
  // getServerSession anropar vår [..nextauth] route och därmed den nya, 
  // vattentäta session-callbacken.
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/'); 
  }

  // Vi behöver inte längre anropa getUserData här. 
  // Den korrekta isNewUser-statusen finns redan i session-objektet.
  const isNewUser = session.user.isNewUser ?? false;

  return (
    <MainAppClientBoundary isNewUser={isNewUser}>
      {children}
    </MainAppClientBoundary>
  );
};

export default MainAppLayout;
