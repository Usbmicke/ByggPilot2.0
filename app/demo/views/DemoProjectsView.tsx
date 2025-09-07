
'use client';
import React from 'react';
import ProjectsView from '@/app/components/views/ProjectsView';
import { demoProjects, demoCustomers } from '../data'; // Importerar vår påhittade data

const DemoProjectsView = () => {

    // Denna funktion simulerar API-anropet för att skapa ett projekt.
    // I demon gör den ingenting, men den behövs för att komponenten ska fungera.
    const handleCreateProject = async (projectData: any) => {
        console.log("Simulerar skapande av projekt:", projectData);
        alert("DEMO: Projektet skulle ha skapats här!");
        return true; // Simulerar ett lyckat anrop
    };

    return (
        <ProjectsView
            // Här matar vi komponenten med vår påhittade data istället för live-data
            projects={demoProjects}
            customers={demoCustomers} 
            onCreateProject={handleCreateProject}
            isLoading={false} // I demon laddar vi aldrig data, så alltid false
        />
    );
};

export default DemoProjectsView;
