import React, { useState, useEffect, useCallback } from 'react';
import PokemonList from './components/PokemonList';
import PokemonDetails from './components/PokemonDetails';
import PokemonCompare from './components/PokemonCompare';
import GenerationTabs from './components/GenerationTabs';
import Skeleton from './components/Skeleton';
import { Pokemon, GenerationResponse, GenerationPokemonSpecies } from './types/pokemon';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allSpecies, setAllSpecies] = useState<GenerationPokemonSpecies[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<GenerationPokemonSpecies[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState(1);

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelectedIds, setCompareSelectedIds] = useState<Set<number>>(new Set());
  const [comparePokemon, setComparePokemon] = useState<Pokemon[]>([]);

  // Fetch only species list (no details)
  const fetchGenerationSpecies = useCallback(async (generation: number) => {
    setLoading(true);
    setError(null);
    setAllSpecies([]);
    setFilteredSpecies([]);

    try {
      const genResponse = await fetch(
        `https://pokeapi.co/api/v2/generation/${generation}`,
      );
      if (!genResponse.ok) throw new Error('Failed to fetch generation data');

      const genData: GenerationResponse = await genResponse.json();
      const species = genData.pokemon_species.sort((a, b) => {
        const idA = parseInt(a.url.match(/\/(\d+)\//)?.[1] || '0', 10);
        const idB = parseInt(b.url.match(/\/(\d+)\//)?.[1] || '0', 10);
        return idA - idB;
      });
      setAllSpecies(species);
      setFilteredSpecies(species);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - fetch gen 1
  useEffect(() => {
    fetchGenerationSpecies(1);
  }, [fetchGenerationSpecies]);

  // Handle generation change
  const handleGenerationChange = (generation: number) => {
    if (generation === currentGeneration) return;
    setCurrentGeneration(generation);
    setSelectedPokemon(null);
    setSearchTerm('');
    setCompareMode(false);
    setCompareSelectedIds(new Set());
    setComparePokemon([]);
    fetchGenerationSpecies(generation);
  };

  // Search filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSpecies(allSpecies);
    } else {
      const filtered = allSpecies.filter(
        (species) =>
          species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          species.url.match(/\/?(\d+)\//)?.[1]?.includes(searchTerm),
      );
      setFilteredSpecies(filtered);
    }
  }, [allSpecies, searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSelectSpecies = async (species: GenerationPokemonSpecies) => {
    // In compare mode, only handle via toggleCompareSelection
    if (compareMode) return;

    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
      if (!res.ok) throw new Error(`Failed to fetch ${species.name}`);
      const data: Pokemon = await res.json();
      setSelectedPokemon(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedPokemon(null);
  };

  // Comparison handlers
  const toggleCompareMode = () => {
    if (compareMode) {
      // If 2 selected, fetch and show comparison
      if (compareSelectedIds.size === 2) {
        const selectedSpecies = allSpecies.filter(s => {
          const id = parseInt(s.url.match(/\/(\d+)\//)?.[1] || '0', 10);
          return compareSelectedIds.has(id);
        });
        fetchComparePokemon(selectedSpecies);
      } else {
        // Exit compare mode without comparing
        setCompareMode(false);
        setCompareSelectedIds(new Set());
      }
    } else {
      setCompareMode(true);
      setCompareSelectedIds(new Set());
      setComparePokemon([]);
      setSelectedPokemon(null);
    }
  };

  const toggleCompareSelection = (species: GenerationPokemonSpecies) => {
    const id = parseInt(species.url.match(/\/(\d+)\//)?.[1] || '0', 10);
    const newSet = new Set(compareSelectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else if (newSet.size < 2) {
      newSet.add(id);
    }
    setCompareSelectedIds(newSet);

    // Auto-fetch when 2 selected
    if (newSet.size === 2) {
      const selectedSpecies = allSpecies.filter(s => {
        const sid = parseInt(s.url.match(/\/(\d+)\//)?.[1] || '0', 10);
        return newSet.has(sid);
      });
      fetchComparePokemon(selectedSpecies);
    }
  };

  const fetchComparePokemon = async (speciesList: GenerationPokemonSpecies[]) => {
    try {
      const promises = speciesList.map(async (species) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
        if (!res.ok) throw new Error(`Failed to fetch ${species.name}`);
        return res.json() as Promise<Pokemon>;
      });
      const results = await Promise.all(promises);
      setComparePokemon(results);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveComparePokemon = (pokemon: Pokemon) => {
    const newSet = new Set(compareSelectedIds);
    newSet.delete(pokemon.id);
    setCompareSelectedIds(newSet);
    const updated = comparePokemon.filter(p => p.id !== pokemon.id);
    setComparePokemon(updated);
    // If less than 2, exit compare mode
    if (newSet.size < 2) {
      setCompareMode(false);
      setCompareSelectedIds(new Set());
      setComparePokemon([]);
    }
  };

  const exitCompare = () => {
    setCompareMode(false);
    setCompareSelectedIds(new Set());
    setComparePokemon([]);
  };

  if (loading) {
    return (
      <div className="app">
        <header className="header">
          <h1><span className="pokeball-icon"></span> Pokédex</h1>
          <p>Explore the world of Pokémon</p>
        </header>
        <GenerationTabs
          currentGeneration={currentGeneration}
          onGenerationChange={handleGenerationChange}
          isLoading={true}
        />
        <div className="pokemon-grid">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="pokemon-card">
              <Skeleton
                width="120px"
                height="120px"
                className="pokemon-image"
              />
              <Skeleton width="80%" height="20px" />
              <Skeleton width="60%" height="16px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  // Show comparison view when 2 pokemon fetched
  if (comparePokemon.length === 2 && compareSelectedIds.size === 2) {
    return (
      <div className="app" id="main-content">
        <PokemonCompare
          pokemonA={comparePokemon[0]}
          pokemonB={comparePokemon[1]}
          onRemove={handleRemoveComparePokemon}
          onBack={exitCompare}
        />
      </div>
    );
  }

  return (
    <div className="app" id="main-content">
      <a href="#main-content" className="skip-link" style={{ display: 'none' }}>
        Skip to main content
      </a>
      <header className="header">
        <h1><span className="pokeball-icon"></span> Pokédex</h1>
        <p>Explore the world of Pokémon</p>
        <button
          className={`compare-toggle-btn${compareMode ? ' active' : ''}`}
          onClick={toggleCompareMode}
          aria-label="Toggle comparison mode"
        >
          ⚔️ Compare
          {compareMode && compareSelectedIds.size > 0 && (
            <span className="badge">{compareSelectedIds.size}</span>
          )}
        </button>
      </header>

      <GenerationTabs
        currentGeneration={currentGeneration}
        onGenerationChange={handleGenerationChange}
        isLoading={loading}
      />

      {compareMode && (
        <div className="compare-mode-bar">
          <p>Select 2 Pokémon to compare {compareSelectedIds.size}/2</p>
          <button className="cancel-compare-btn" onClick={exitCompare} aria-label="Cancel comparison">✕</button>
        </div>
      )}

      {detailLoading ? (
        <div className="pokemon-details">
          <div className="loading-details">
            <p>Loading details...</p>
          </div>
        </div>
      ) : selectedPokemon ? (
        <PokemonDetails pokemon={selectedPokemon} onBack={handleBack} />
      ) : (
        <>
          <form
            className="search-container"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <input
              type="text"
              className="search-input"
              placeholder="Search Pokémon by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search Pokémon by name or ID"
            />
            <button
              type="submit"
              className="search-btn"
              aria-label="Search Pokémon"
            >
              Search
            </button>
          </form>

          <PokemonList
            speciesList={filteredSpecies}
            onSelect={handleSelectSpecies}
            onCompare={toggleCompareSelection}
            compareSelected={compareSelectedIds}
            isCompareMode={compareMode}
          />
        </>
      )}
    </div>
  );
}

export default App;
