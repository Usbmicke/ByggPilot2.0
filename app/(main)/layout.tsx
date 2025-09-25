
import React from 'react';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
import { getServerSession } from 'next-auth/next';
import { getUserData } from '@/app/actions/userActions';
import MainAppClientBoundary from './MainAppClientBoundary';

const MainAppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // Detta är en fallback - NextAuth middleware bör redan ha agerat.
    return redirect('/'); 
  }

  const userData = await getUserData(session.user.id);
  
  // Server-komponentens enda jobb är att hämta data och skicka ner den.
  // Omdirigeringslogiken hanteras nu helt av klient-komponenten.
  return (
    <MainAppClientBoundary isNewUser={userData?.isNewUser ?? false}>
      {children}
    </MainAppClientBoundary>
  );
};

export default MainAppLayout;
