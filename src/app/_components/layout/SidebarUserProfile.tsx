'use client'
import React from 'react'
import Image from 'next/image'
import { type User } from '@firebase/auth';

// Denna komponent är nu en ren presentationskomponent.
// Den tar emot användarobjektet som en prop.

interface SidebarUserProfileProps {
    user: User;
}

export default function SidebarUserProfile({ user }: SidebarUserProfileProps) {
  return (
    <div className="flex items-center gap-3">
        <Image
            src={user.photoURL || 'https://via.placeholder.com/40'} // Använd defaultbild om photoURL saknas
            alt="Användarbild"
            width={40}
            height={40}
            className="rounded-full"
        />
        <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-neutral-200">
                {user.displayName || 'Användare'}
            </p>
            <p className="truncate text-xs text-neutral-400">
                {user.email || ''}
            </p>
        </div>
    </div>
  )
}
