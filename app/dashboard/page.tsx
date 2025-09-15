'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardView from '@/app/components/views/DashboardView';
import { mockData } from '@/app/services/mockData';

export default function DashboardPage() {
    const { data: session } = useSession();
    const isDemo = !session; // If no session, run in demo mode

    // In a real app, you'd fetch this data based on the session
    const data = isDemo ? mockData : { projects: [], customers: [], contacts: [] };

    // These would come from a settings context or similar
    const showWeatherWidget = true;
    const showTodoWidget = true;

    return (
        <DashboardView 
            projects={data.projects} 
            showWeather={showWeatherWidget}
            showTodo={showTodoWidget}
        />
    );
}
