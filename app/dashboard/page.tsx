'use client';

import React from 'react';
import ProjectOverview from '@/app/components/dashboard/ProjectOverview';

/**
 * Denna sida är nu extremt enkel. Den visar bara projektöversikten.
 * All logik för onboarding och dataladdning hanteras i DashboardLayout.
 */
export default function DashboardPage() {
    return (
        <ProjectOverview />
    );
}
