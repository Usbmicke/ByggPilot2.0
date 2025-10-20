
'use client';

import React from 'react';
import type { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// =================================================================================
// USER PROFILE V1.0
// BESKRIVNING: En enkel komponent som visar användarens profilbild och namn.
// Tar emot ett `User`-objekt från NextAuth.js.
// Steg B.3 i arkitekturplanen.
// =================================================================================

interface UserProfileProps {
    // Accepterar en partiell User-typ för flexibilitet
    user: Partial<Pick<User, 'name' | 'image' | 'email'>>;
}

const UserProfile = ({ user }: UserProfileProps) => {
    // Bestäm fallback-initialer från namn eller e-post
    const getInitials = () => {
        if (user.name) {
            const names = user.name.split(' ');
            return names.length > 1
                ? `${names[0][0]}${names[names.length - 1][0]}`
                : names[0][0];
        }
        if (user.email) {
            return user.email[0].toUpperCase();
        }
        return 'U'; // Standard-fallback
    };

    return (
        <div className="flex items-center space-x-3 p-2 rounded-md bg-background-tertiary">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User avatar"} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="truncate">
                <p className="text-sm font-medium truncate">{user.name ?? 'Användare'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
        </div>
    );
};

export default UserProfile;
