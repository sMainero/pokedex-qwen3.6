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

const ALL_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const GEN_GRADIENTS: Record<number, string> = {
  1: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',  // Kanto: deep blue
  2: 'linear-gradient(135deg, #1a2e2e 0%, #0f3434 50%, #0a2a2a 100%)',  // Johto: dark teal
  3: 'linear-gradient(135deg, #2e1a1a 0%, #340f1a 50%, #2a0a15 100%)',  // Hoenn: crimson
  4: 'linear-gradient(135deg, #2e2e1a 0%, #34340f 50%, #2a2a0a 100%)',  // Sinnoh: gold
  5: 'linear-gradient(135deg, #1a1a2e 0%, #290f34 50%, #200a2a 100%)',  // Unova: purple
  6: 'linear-gradient(135deg, #1a2e1a 0%, #0f340f 50%, #0a2a0a 100%)',  // Kalos: emerald
  7: 'linear-gradient(135deg, #2e1a2e 0%, #340f34 50%, #2a0a2a 100%)',  // Alola: magenta
  8: 'linear-gradient(135deg, #1a2a1a 0%, #0f2a0f 50%, #0a200a 100%)',  // Galar: forest
  9: 'linear-gradient(135deg, #2e2e2e 0%, #2a2a2a 50%, #202020 100%)',  // Paldea: slate
};

const CACHE_KEY = 'pokedex-all-species';
const CACHE_EXPIRY_KEY = 'pokedex-cache-timestamp';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allSpecies, setAllSpecies] = useState<GenerationPokemonSpecies[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<GenerationPokemonSpecies[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>(ALL_GENERATIONS);
  const [allGenerationsLoaded, setAllGenerationsLoaded] = useState(false);

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelectedIds, setCompareSelectedIds] = useState<Set<number>>(new Set());
  const [compareSelected, setCompareSelected] = useState<Pokemon[]>([]);
  const [compareViewActive, setCompareViewActive] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_TTL) {
          const species: GenerationPokemonSpecies[] = JSON.parse(cached);
          setAllSpecies(species);
          setFilteredSpecies(species);
          setAllGenerationsLoaded(true);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore cache errors
    }
    // No valid cache — fetch all generations
    fetchAllGenerations();
  }, []);

  // Fetch all 9 generations and merge
  const fetchAllGenerations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        ALL_GENERATIONS.map(async (genId) => {
          const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`);
          if (!res.ok) throw new Error(`Failed to fetch generation ${genId}`);
          const data: GenerationResponse = await res.json();
          const speciesWithGen = data.pokemon_species.map(s => ({
            ...s,
            generation: genId,
          }));
          return speciesWithGen;
        }),
      );

      const merged = results.flat().sort((a, b) => {
        const idA = parseInt(a.url.match(/\/(\d+)\//)?.[1] || '0', 10);
        const idB = parseInt(b.url.match(/\/(\d+)\//)?.[1] || '0', 10);
        return idA - idB;
      });

      setAllSpecies(merged);
      setFilteredSpecies(merged);
      setAllGenerationsLoaded(true);

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
  }, []);

  // Update background gradient based on selected generations
  useEffect(() => {
    if (selectedGenerations.length === ALL_GENERATIONS.length) {
      // All selected — use a gradient that blends multiple generations
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #2e1a1a 50%, #2e2e1a 75%, #1a2e1a 100%)';
    } else {
      // Use the first selected generation's gradient
      const gradient = GEN_GRADIENTS[selectedGenerations[0]] || GEN_GRADIENTS[1];
      document.body.style.background = gradient;
    }
  }, [selectedGenerations]);

  // Toggle a generation filter
  const handleGenerationToggle = (generation: number) => {
    setSelectedGenerations(prev => {
      if (prev.includes(generation)) {
        return prev.filter(g => g !== generation);
      }
      return [...prev, generation];
    });
  };

  // Search + generation filtering
  useEffect(() => {
    let filtered = allSpecies;

    // Apply generation filter
    if (selectedGenerations.length < ALL_GENERATIONS.length) {
      filtered = filtered.filter(s => selectedGenerations.includes(s.generation));
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (species) =>
          species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          species.url.match(/\/?(\d+)\//)?.[1]?.includes(searchTerm),
      );
    }

    setFilteredSpecies(filtered);
  }, [allSpecies, searchTerm, selectedGenerations]);

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
          disabled={loading}
          aria-label="Toggle comparison mode"
        >
          ⚔️ Compare
          {compareMode && compareSelectedIds.size > 0 && (
            <span className="badge">{compareSelectedIds.size}</span>
          )}
        </button>
      </header>

      <GenerationTabs
        selectedGenerations={selectedGenerations}
        onGenerationToggle={handleGenerationToggle}
        isLoading={loading}
        allGenerationsLoaded={allGenerationsLoaded}
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
              disabled={loading}
            />
            <button
              type="submit"
              className="search-btn"
              aria-label="Search Pokémon"
              disabled={loading}
            >
              Search
            </button>
          </form>

          <div className="grid-container">
            <div className={`grid-layer skeleton-layer ${loading ? 'visible' : 'hidden'}`}>
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
            <div className={`grid-layer list-layer ${loading ? 'hidden' : 'visible'}`}>
              <PokemonList
                speciesList={filteredSpecies}
                onSelect={handleSelectSpecies}
                onCompareToggle={toggleCompareSelection}
                compareSelectedIds={compareSelectedIds}
                isCompareMode={compareMode}
                compareMaxReached={compareSelectedIds.size >= COMPARE_MAX}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
