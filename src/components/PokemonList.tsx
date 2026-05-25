import { PokemonListProps } from '../types/components';
import { GenerationPokemonSpecies } from '../types/pokemon';
import './PokemonList.css';

function PokemonList({
  speciesList,
  onSelect,
  onCompareToggle,
  compareSelectedIds,
  isCompareMode,
  compareMaxReached,
}: PokemonListProps) {
  const handleSelect = (species: GenerationPokemonSpecies) => {
    if (isCompareMode) {
      onCompareToggle?.(species);
      return;
    }
    onSelect(species);
  };

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
          const isSelected = compareSelectedIds?.has(id);
          const isMaxed = compareMaxReached && !isSelected;

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
                  className={`compare-select-btn${isSelected ? ' selected' : ''}${isMaxed ? ' maxed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompareToggle?.(species);
                  }}
                  disabled={isMaxed}
                  aria-label={`${isSelected ? 'Remove' : 'Add'} ${species.name} to comparison`}
                >
                  {isSelected ? '✓ Selected' : isMaxed ? 'Max reached' : '+ Compare'}
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
