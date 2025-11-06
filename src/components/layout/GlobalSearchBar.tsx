
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SearchResults from '@/components/layout/SearchResults';

const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Hantera klick utanför sökkomponenten för att stänga resultatlistan
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleResultClick = () => {
    setQuery('');
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchContainerRef}>
      <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
      <input 
        type="search" 
        placeholder="Sök efter projekt, kunder, dokument..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="w-full bg-background-primary border border-border-primary text-text-primary rounded-lg pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-200"
      />
      {isFocused && query && (
        <SearchResults query={query} onResultClick={handleResultClick} />
      )}
    </div>
  );
};

export default GlobalSearchBar;
