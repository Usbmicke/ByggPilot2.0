// Fil: app/page.tsx
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <p>Laddar...</p>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Image
        src="/images/byggpilot.png"
        alt="ByggPilot Logotyp"
        width={200}
        height={50}
      />
      <h1 className="text-4xl font-bold my-8">Välkommen till ByggPilot 2.0</h1>

      {session ? (
        <div>
          <p>Inloggad som: {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Logga ut
          </button>
        </div>
      ) : (
        <div>
          <p>Du är inte inloggad.</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Logga in med Google
          </button>
        </div>
      )}
    </main>
  )
}
