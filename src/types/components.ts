// Component TypeScript interfaces

import { Pokemon, GenerationPokemonSpecies } from './pokemon';

export interface PokemonListProps {
  speciesList: GenerationPokemonSpecies[];
  onSelect: (species: GenerationPokemonSpecies) => void;
  onCompareToggle?: (species: GenerationPokemonSpecies) => void;
  compareSelectedIds?: Set<number>;
  isCompareMode?: boolean;
  compareMaxReached?: boolean;
  visibleIndices?: number[];
}

export interface PokemonDetailsProps {
  pokemon: Pokemon;
  onBack: () => void;
  isLoading?: boolean;
}

export interface PokemonCompareProps {
  pokemonList: Pokemon[];
  onRemove: (pokemon: Pokemon) => void;
  onBack: () => void;
}
