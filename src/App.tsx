import React, { useState, useEffect, useCallback } from 'react';
import PokemonList from './components/PokemonList';
import PokemonDetails from './components/PokemonDetails';
import PokemonCompare from './components/PokemonCompare';
import GenerationTabs from './components/GenerationTabs';
import Skeleton from './components/Skeleton';
import { Pokemon, GenerationResponse, GenerationPokemonSpecies } from './types/pokemon';
import './App.css';

const COMPARE_MIN = 2;
const COMPARE_MAX = 4;

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
  const [compareSelected, setCompareSelected] = useState<Pokemon[]>([]);
  const [compareViewActive, setCompareViewActive] = useState(false);
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

  // Handle generation change — preserve compare state for cross-gen
  const handleGenerationChange = (generation: number) => {
    if (generation === currentGeneration) return;
    setCurrentGeneration(generation);
    setSelectedPokemon(null);
    setSearchTerm('');
    // Do NOT clear compare state — cross-gen comparison
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

  // Toggle compare mode — entering preserves prior selection
  const toggleCompareMode = () => {
    if (compareMode) {
      stopSelecting();
    } else {
      setCompareMode(true);
      setSelectedPokemon(null);
    }
  };

  // Add/remove pokemon from comparison selection
  const toggleCompareSelection = async (species: GenerationPokemonSpecies) => {
    const id = parseInt(species.url.match(/\/(\d+)\//)?.[1] || '0', 10);
    const newIds = new Set(compareSelectedIds);

    if (newIds.has(id)) {
      // Remove from selection
      newIds.delete(id);
      setCompareSelectedIds(newIds);
      setCompareSelected(prev => prev.filter(p => p.id !== id));
    } else if (newIds.size < COMPARE_MAX) {
      // Add — fetch detail first
      newIds.add(id);
      setCompareSelectedIds(newIds);

      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
        if (!res.ok) throw new Error(`Failed to fetch ${species.name}`);
        const data: Pokemon = await res.json();
        setCompareSelected(prev => [...prev, data]);
      } catch (err: any) {
        setError(err.message);
        newIds.delete(id);
        setCompareSelectedIds(newIds);
      }
    }
  };

  // Start comparison — show comparison view
  const startComparison = () => {
    if (compareSelected.length >= COMPARE_MIN) {
      setCompareViewActive(true);
    }
  };

  // Stop selecting — clear selection, exit compare mode
  const stopSelecting = () => {
    setCompareMode(false);
    setCompareSelectedIds(new Set());
    setCompareSelected([]);
    setCompareViewActive(false);
  };

  // Remove single pokemon from comparison view
  const handleRemoveComparePokemon = (pokemon: Pokemon) => {
    const newIds = new Set(compareSelectedIds);
    newIds.delete(pokemon.id);
    setCompareSelectedIds(newIds);
    const updated = compareSelected.filter(p => p.id !== pokemon.id);
    setCompareSelected(updated);

    // If below minimum, exit comparison view
    if (newIds.size < COMPARE_MIN) {
      setCompareViewActive(false);
      setCompareSelectedIds(new Set());
      setCompareSelected([]);
    }
  };

  const exitCompare = () => {
    setCompareViewActive(false);
    setCompareMode(false);
    setCompareSelectedIds(new Set());
    setCompareSelected([]);
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

  // Show comparison view
  if (compareViewActive && compareSelected.length >= COMPARE_MIN) {
    return (
      <div className="app" id="main-content">
        <PokemonCompare
          pokemonList={compareSelected}
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
          <div className="compare-chips-container">
            {compareSelected.map(p => (
              <span key={p.id} className="compare-chip">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  alt={p.name}
                  className="compare-chip-sprite"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/pokemon-placeholder.png'; }}
                />
                {p.name} #{p.id.toString().padStart(3, '0')}
                <button
                  className="compare-chip-remove"
                  onClick={() => {
                    const newIds = new Set(compareSelectedIds);
                    newIds.delete(p.id);
                    setCompareSelectedIds(newIds);
                    setCompareSelected(prev => prev.filter(x => x.id !== p.id));
                  }}
                  aria-label={`Remove ${p.name} from comparison`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="compare-actions">
            <p>{compareSelected.length}/{COMPARE_MAX} selected (min {COMPARE_MIN})</p>
            <button
              className="start-compare-btn"
              onClick={startComparison}
              disabled={compareSelected.length < COMPARE_MIN}
              aria-label="Start comparison"
            >
              Start Comparison
            </button>
            <button
              className="stop-selecting-btn"
              onClick={stopSelecting}
              aria-label="Stop selecting Pokémon"
            >
              Stop Selecting
            </button>
          </div>
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
            onCompareToggle={toggleCompareSelection}
            compareSelectedIds={compareSelectedIds}
            isCompareMode={compareMode}
            compareMaxReached={compareSelectedIds.size >= COMPARE_MAX}
          />
        </>
      )}
    </div>
  );
}

export default App;
