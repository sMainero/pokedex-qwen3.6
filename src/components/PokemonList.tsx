import { PokemonListProps } from '../types/components';
import { GenerationPokemonSpecies } from '../types/pokemon';
import './PokemonList.css';

function PokemonList({
  speciesList,
  onSelect,
  onCompare,
  compareSelected,
  isCompareMode,
}: PokemonListProps) {
  const handleSelect = (species: GenerationPokemonSpecies) => {
    if (isCompareMode) {
      onCompare?.(species);
      return;
    }
    onSelect(species);
  };

  const handleCompare = (e: React.MouseEvent, species: GenerationPokemonSpecies) => {
    e.stopPropagation();
    onCompare?.(species);
  };

  // Extract ID from URL like "https://pokeapi.co/api/v2/pokemon-species/1/"
  const getIdFromUrl = (url: string): number => {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  if (speciesList.length === 0) {
    return (
      <div className="no-results">
        <p>No Pokémon found matching your search.</p>
      </div>
    );
  }

  return (
    <>
      <div className="pokemon-grid">
        {speciesList.map((species) => {
          const id = getIdFromUrl(species.url);
          const isSelected = compareSelected?.has(id);
          return (
            <div
              key={id}
              className={`pokemon-card${isSelected ? ' compare-selected' : ''}`}
              onClick={() => handleSelect(species)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelect(species);
                }
              }}
              aria-label={`View details for ${species.name} (ID: ${id})`}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                alt={species.name}
                className="pokemon-image"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/images/pokemon-placeholder.png';
                }}
              />
              <div className="pokemon-name">
                {species.name}
                <span className="pokemon-id">
                  #{id.toString().padStart(3, '0')}
                </span>
              </div>
              {isCompareMode && (
                <button
                  className={`compare-select-btn${isSelected ? ' selected' : ''}`}
                  onClick={(e) => handleCompare(e, species)}
                  aria-label={`${isSelected ? 'Remove' : 'Add'} ${species.name} to comparison`}
                >
                  {isSelected ? '✓ Selected' : '+ Compare'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PokemonList;
