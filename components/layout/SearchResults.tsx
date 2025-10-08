
'use client';

import React from 'react';
import { FolderIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useProjects, useCustomers } from '@/hooks/useApi';
import Link from 'next/link';

interface SearchResultsProps {
  query: string;
  onResultClick: () => void; // Ny prop för att hantera klick
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onResultClick }) => {
  const { projects, isLoading: isLoadingProjects, isError: isErrorProjects } = useProjects();
  const { customers, isLoading: isLoadingCustomers, isError: isErrorCustomers } = useCustomers();

  if (!query) return null;

  const isLoading = isLoadingProjects || isLoadingCustomers;
  const isError = isErrorProjects || isErrorCustomers;

  const lowerCaseQuery = query.toLowerCase();

  const filteredProjects = projects?.filter(p => p.name.toLowerCase().includes(lowerCaseQuery)) || [];
  const filteredCustomers = customers?.filter(c => c.name.toLowerCase().includes(lowerCaseQuery)) || [];

  const hasResults = filteredProjects.length > 0 || filteredCustomers.length > 0;

  return (
    <div className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-background-secondary rounded-lg border border-border-primary shadow-lg z-50">
      {isLoading ? (
        <div className="p-4 text-center text-sm text-text-secondary">Hämtar data...</div>
      ) : isError ? (
        <div className="p-4 text-center text-sm text-status-danger">Kunde inte hämta data.</div>
      ) : hasResults ? (
        <div className="p-2">
          {filteredProjects.length > 0 && (
            <div className="mb-2">
              <h3 className="text-xs font-semibold text-text-secondary uppercase px-3 py-1">Projekt</h3>
              <ul>
                {filteredProjects.map(project => (
                  <li key={project.id} onClick={onResultClick}>
                     <Link href={`/projects/${project.id}`} legacyBehavior>
                        <a className="flex items-center gap-3 p-3 rounded-md hover:bg-background-tertiary cursor-pointer">
                           <FolderIcon className="h-5 w-5 text-text-secondary" />
                           <span className="text-sm text-text-primary">{project.name}</span>
                        </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {filteredCustomers.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text-secondary uppercase px-3 py-1">Kunder</h3>
              <ul>
                {filteredCustomers.map(customer => (
                  <li key={customer.id} onClick={onResultClick}>
                     <Link href={`/customers/${customer.id}`} legacyBehavior>
                        <a className="flex items-center gap-3 p-3 rounded-md hover:bg-background-tertiary cursor-pointer">
                            <UsersIcon className="h-5 w-5 text-text-secondary" />
                            <span className="text-sm text-text-primary">{customer.name}</span>
                        </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-sm text-text-secondary">Inga resultat för "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
