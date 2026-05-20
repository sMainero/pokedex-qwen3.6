// Component TypeScript interfaces

import { Pokemon, GenerationPokemonSpecies } from './pokemon';

export interface PokemonListProps {
  speciesList: GenerationPokemonSpecies[];
  onSelect: (species: GenerationPokemonSpecies) => void;
  onCompare?: (species: GenerationPokemonSpecies) => void;
  compareSelected?: Set<number>;
  isCompareMode?: boolean;
}

export interface PokemonDetailsProps {
  pokemon: Pokemon;
  onBack: () => void;
  isLoading?: boolean;
}

export interface PokemonCompareProps {
  pokemonA: Pokemon;
  pokemonB: Pokemon;
  onRemove: (pokemon: Pokemon) => void;
  onBack: () => void;
}
