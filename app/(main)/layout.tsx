
import React from 'react';
import { redirect } from 'next/navigation';
// =================================================================================
// KORRIGERING: Importera authOptions från den enda, sanna källan.
// Detta löser "Module not found: Can't resolve '@/lib/auth'"-felet.
// =================================================================================
import { authOptions } from '@/api/auth/[...nextauth]/route'; 
import { getServerSession } from 'next-auth/next';
import MainAppClientBoundary from './MainAppClientBoundary';

const MainAppLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/'); 
  }

  // isNewUser hanteras nu helt och hållet på klientsidan i MainAppClientBoundary
  // baserat på information från useSession-hooken.
  const isNewUser = session.user.isNewUser ?? false; // Skickas med som prop

  return (
    <MainAppClientBoundary isNewUser={isNewUser}>
      {children}
    </MainAppClientBoundary>
  );
};

export default MainAppLayout;
