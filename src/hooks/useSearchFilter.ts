import { useState, useMemo } from 'react';
import { GenerationPokemonSpecies } from '../types/pokemon';

export interface UseSearchFilterReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredItems: GenerationPokemonSpecies[];
}

export function useSearchFilter(
  allItems: GenerationPokemonSpecies[],
  selectedGenerations?: number[],
  allGenerations?: number[],
): UseSearchFilterReturn {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    let items = allItems;

    // Apply generation filter first
    if (selectedGenerations && allGenerations && selectedGenerations.length < allGenerations.length) {
      items = items.filter(s => selectedGenerations.includes(s.generation));
    }

    // Then apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      items = items.filter(species => {
        const nameMatch = species.name.toLowerCase().includes(term);
        const idMatch = species.url.match(/\/?(\d+)\//)?.[1]?.includes(term);
        return nameMatch || idMatch;
      });
    }

    return items;
  }, [allItems, searchTerm, selectedGenerations, allGenerations]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
  };
}
