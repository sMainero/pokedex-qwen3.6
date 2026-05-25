// @ts-nocheck — legacy hook, unused by App.tsx per AGENTS.md
import { useState, useCallback } from 'react';
import { Pokemon } from '../types/pokemon';

interface UsePokemonDataOptions {
  limit?: number;
  debounced?: boolean;
  debounceMs?: number;
}

interface UsePokemonDataReturn {
  allPokemon: Pokemon[];
  filteredPokemon: Pokemon[];
  loading: boolean;
  error: string | null;
  searchDebounceMs: number;
  setSearchTerm: (term: string) => void;
  reset: () => void;
}

export function usePokemonData(options: UsePokemonDataOptions = {}): UsePokemonDataReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDebounceMs, setSearchDebounceMs] = useState(0);

  const fetchPokemonData = useCallback(async (limit = options.limit || 151) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch Pokemon data');

      const data = await response.json();
      const pokemonDetails = await Promise.all(
        data.results.map(async (pokemon: { name: string; url: string }) => {
          const detail = await fetch(pokemon.url).then(r => r.json());
          return {
            id: detail.id,
            name: detail.name,
            url: pokemon.url,
            ...detail
          } as Pokemon;
        })
      );

      setAllPokemon(pokemonDetails);
      setFilteredPokemon(pokemonDetails);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const filtered = allPokemon.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.id.toString().includes(searchTerm)
    );
    setFilteredPokemon(filtered);
  }, [allPokemon, searchTerm]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(e);
  }, [handleSearch]);

  const reset = useCallback(() => {
    setSearchTerm('');
    setFilteredPokemon(allPokemon);
  }, [allPokemon]);

  return {
    allPokemon,
    filteredPokemon,
    loading,
    error,
    searchDebounceMs,
    setSearchTerm,
    reset,
  };
}
