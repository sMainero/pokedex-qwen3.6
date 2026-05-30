import React, { useState } from 'react';
import PokemonList from './components/PokemonList';
import PokemonDetails from './components/PokemonDetails';
import PokemonCompare from './components/PokemonCompare';
import GenerationTabs from './components/GenerationTabs';
import { usePokemonContext } from './contexts/PokemonContext';
import { useSearchFilter } from './hooks/useSearchFilter';
import { useInfinitePagination } from './hooks/useInfinitePagination';
import { Pokemon, GenerationPokemonSpecies } from './types/pokemon';
import './App.css';

const COMPARE_MIN = 2;
const COMPARE_MAX = 4;
const PAGE_SIZE = 25;

const ALL_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function App() {
  // State
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>(ALL_GENERATIONS);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelectedIds, setCompareSelectedIds] = useState<Set<number>>(new Set());
  const [compareSelected, setCompareSelected] = useState<Pokemon[]>([]);
  const [compareViewActive, setCompareViewActive] = useState(false);

  // Context: all species data
  const { allSpecies, loading, error } = usePokemonContext();

  // Search + generation filter: filter within context
  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(allSpecies, selectedGenerations, ALL_GENERATIONS);

  // Pagination: 25 at a time
  const { visibleItems, hasMore, loadMoreRef } = useInfinitePagination({
    items: filteredItems,
    pageSize: PAGE_SIZE,
  });

  // Update background gradient
  React.useEffect(() => {
    if (selectedGenerations.length === ALL_GENERATIONS.length) {
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #2e1a1a 50%, #2e2e1a 75%, #1a2e1a 100%)';
    } else {
      const GEN_GRADIENTS: Record<number, string> = {
        1: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        2: 'linear-gradient(135deg, #1a2e2e 0%, #0f3434 50%, #0a2a2a 100%)',
        3: 'linear-gradient(135deg, #2e1a1a 0%, #340f1a 50%, #2a0a15 100%)',
        4: 'linear-gradient(135deg, #2e2e1a 0%, #34340f 50%, #2a2a0a 100%)',
        5: 'linear-gradient(135deg, #1a1a2e 0%, #290f34 50%, #200a2a 100%)',
        6: 'linear-gradient(135deg, #1a2e1a 0%, #0f340f 50%, #0a2a0a 100%)',
        7: 'linear-gradient(135deg, #2e1a2e 0%, #340f34 50%, #2a0a2a 100%)',
        8: 'linear-gradient(135deg, #1a2a1a 0%, #0f2a0f 50%, #0a200a 100%)',
        9: 'linear-gradient(135deg, #2e2e2e 0%, #2a2a2a 50%, #202020 100%)',
      };
      const gradient = GEN_GRADIENTS[selectedGenerations[0]] || GEN_GRADIENTS[1];
      document.body.style.background = gradient;
    }
  }, [selectedGenerations]);

  const handleGenerationToggle = (generation: number) => {
    setSelectedGenerations(prev => {
      if (prev.includes(generation)) {
        return prev.filter(g => g !== generation);
      }
      return [...prev, generation];
    });
  };

  // visibleItems already filtered by generation (via useSearchFilter)
  const generationFilteredItems = visibleItems;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSelectSpecies = async (species: GenerationPokemonSpecies) => {
    if (compareMode) return;

    setDetailLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
      if (!res.ok) throw new Error(`Failed to fetch ${species.name}`);
      const data: Pokemon = await res.json();
      setSelectedPokemon(data);
    } catch (err: any) {
      // API error — ignore, user stays on list
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedPokemon(null);
  };

  const toggleCompareMode = () => {
    if (compareMode) {
      stopSelecting();
    } else {
      setCompareMode(true);
      setSelectedPokemon(null);
    }
  };

  const toggleCompareSelection = async (species: GenerationPokemonSpecies) => {
    const id = parseInt(species.url.match(/\/(\d+)\//)?.[1] || '0', 10);
    const newIds = new Set(compareSelectedIds);

    if (newIds.has(id)) {
      newIds.delete(id);
      setCompareSelectedIds(newIds);
      setCompareSelected(prev => prev.filter(p => p.id !== id));
    } else if (newIds.size < COMPARE_MAX) {
      newIds.add(id);
      setCompareSelectedIds(newIds);

      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.name}`);
        if (!res.ok) throw new Error(`Failed to fetch ${species.name}`);
        const data: Pokemon = await res.json();
        setCompareSelected(prev => [...prev, data]);
      } catch (err: any) {
        newIds.delete(id);
        setCompareSelectedIds(newIds);
      }
    }
  };

  const startComparison = () => {
    if (compareSelected.length >= COMPARE_MIN) {
      setCompareViewActive(true);
    }
  };

  const stopSelecting = () => {
    setCompareMode(false);
    setCompareSelectedIds(new Set());
    setCompareSelected([]);
    setCompareViewActive(false);
  };

  const handleRemoveComparePokemon = (pokemon: Pokemon) => {
    const newIds = new Set(compareSelectedIds);
    newIds.delete(pokemon.id);
    setCompareSelectedIds(newIds);
    const updated = compareSelected.filter(p => p.id !== pokemon.id);
    setCompareSelected(updated);

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
        allGenerationsLoaded={!loading}
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

          {loading ? (
            <div className="loading">Loading Pokémon...</div>
          ) : generationFilteredItems.length === 0 ? (
            <div className="no-results">
              <p>No Pokémon found matching your search.</p>
            </div>
          ) : (
            <>
              <PokemonList
                speciesList={generationFilteredItems}
                onSelect={handleSelectSpecies}
                onCompareToggle={toggleCompareSelection}
                compareSelectedIds={compareSelectedIds}
                isCompareMode={compareMode}
                compareMaxReached={compareSelectedIds.size >= COMPARE_MAX}
              />

              {hasMore && (
                <div
                  ref={loadMoreRef}
                  style={{ height: '1px', width: '100%' }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
