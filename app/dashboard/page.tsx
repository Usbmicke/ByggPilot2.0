'use client';

import React from 'react';
import ZeroState from '@/app/components/views/ZeroState';

/**
 * Denna sida är nu extremt enkel. Den visar bara ZeroState-vyn.
 * All logik för onboarding och dataladdning hanteras i DashboardLayout.
 */
export default function DashboardPage() {
    return (
        <ZeroState />
    );
}
