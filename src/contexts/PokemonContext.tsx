import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GenerationPokemonSpecies } from '../types/pokemon';

interface PokemonContextState {
  allSpecies: GenerationPokemonSpecies[];
  loading: boolean;
  error: string | null;
  loadFromCache: () => void;
  loadFromAPI: () => Promise<void>;
}

const PokemonContext = createContext<PokemonContextState | null>(null);

const CACHE_KEY = 'pokedex-all-species';
const CACHE_EXPIRY_KEY = 'pokedex-cache-timestamp';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function PokemonProvider({ children }: { children: ReactNode }) {
  const [allSpecies, setAllSpecies] = useState<GenerationPokemonSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_TTL) {
          const species: GenerationPokemonSpecies[] = JSON.parse(cached);
          setAllSpecies(species);
          setLoading(false);
          return true;
        }
      }
    } catch {
      // Ignore cache errors
    }
    return false;
  };

  const loadFromAPI = async () => {
    setLoading(true);
    setError(null);

    try {
      const GEN_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const results = await Promise.all(
        GEN_IDS.map(async (genId) => {
          const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
          if (!res.ok) throw new Error(`Failed to fetch generation ${genId}`);
          const data = await res.json();
          return data.pokemon_species.map((s: { name: string; url: string }) => ({
            ...s,
            generation: genId,
          }));
        }),
      );

      const merged = results.flat().sort((a, b) => {
        const idA = parseInt(a.url.match(/\/(\d+)\//)?.[1] || '0', 10);
        const idB = parseInt(b.url.match(/\/(\d+)\//)?.[1] || '0', 10);
        return idA - idB;
      });

      setAllSpecies(merged);

      // Cache to localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        localStorage.setItem(CACHE_EXPIRY_KEY, Date.now().toString());
      } catch {
        // localStorage full or unavailable — ignore
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load from cache on mount
  React.useEffect(() => {
    const hasCache = loadFromCache();
    if (!hasCache) {
      loadFromAPI();
    }
  }, []);

  return (
    <PokemonContext.Provider value={{ allSpecies, loading, error, loadFromCache, loadFromAPI }}>
      {children}
    </PokemonContext.Provider>
  );
}

export function usePokemonContext() {
  const ctx = useContext(PokemonContext);
  if (!ctx) throw new Error('usePokemonContext must be used within PokemonProvider');
  return ctx;
}
